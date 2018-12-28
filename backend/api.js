const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const url = require('url');
const fetch = require('node-fetch');

const { requiresAuth, dateTypeKeys } = require('./util.js');
const api = new Router();

/* Login endpoint for admin */
const isProduction = process.env.NODE_ENV === 'production';
api.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await req.db.collection('users').findOne({ username });
    if (!user) {
      res.status(401).json({ auth: false });
      return;
    }

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      res.status(401).json({ auth: false });
      return;
    }

    const { _id: id, admin } = user;
    jwt.sign({ id, admin }, process.env.SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) {
        next(err);
        return;
      }

      const [header, payload, signature] = token.split('.');
      res.cookie('payload', `${header}.${payload}`, {
        // So that it is testable on localhost.
        // Cookies are expired on end of session
        secure: isProduction,
        sameSite: true,
      });
      res.cookie('signature', signature, {
        httpOnly: true,
        secure: isProduction,
        sameSite: true,
      });
      res.status(200).json({ auth: true });
    });
  } catch(error) {
    next(error);
  }
});

api.get('/specialDates', async ({ db, query: { type, year, onlyDates } }, res, next) => {
  try {
    if (!type && year) {
      const docs = await db.collection('specialDates').find({ year }).toArray();

      // Request for only dates by app
      if (onlyDates) {
        const dates = docs.reduce((datesDict, { type, dates, settings }) => {
          if (type === '5') {
            return {
              ...datesDict,
              ...settings,
            };
          }

          datesDict[dateTypeKeys[type]] = [
            ...datesDict[dateTypeKeys[type]] || [],
            ...dates.map(obj => obj.date),
          ];
          return datesDict;
        }, {});
        res.status(200).json(dates);
        return;
      }

      res.status(200).json(docs);
      return;
    }

    const doc = await db.collection('specialDates').findOne({ type, year });
    res.status(200).json(doc);
  } catch(error) {
    next(error);
  }
});

api.post('/specialDates', requiresAuth(user => user.admin), async ({ db, body, query: { type, year } }, res, next) => {
  try {
    const set = body.dates ? { dates: body.dates } : { settings: body.settings };
    await db.collection('specialDates').update(
      { type, year }, 
      { $set: set }, 
      { upsert: true },
    );
    res.status(200).json({ auth: true });
  } catch(error) {
    next(error);
  }
});

const hostname = process.env.NODE_ENV === 'development'
  ? 'localhost:5000'
  : 'whs-server.herokuapp.com';
api.post('/shorten', async (req, res, next) => {
  try {
    const response = await fetch(
      'https://api-ssl.bitly.com/v4/shorten',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.BITLY_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          long_url: url.format({
            protocol: req.protocol,
            host: hostname,
            pathname: '/api/share',
            query: {
              d: req.query.d,
            },
          }),
        }),
      },
    );
    const json = await response.json();
    res.status(200).json({ link: `https://${json.id}` });
  } catch(error) {
    next(error);
  }
});

// Endpoint to rehydrate schedule, see WHS/src/util/qr.js for compression
api.get('/share', async ({ query: { d } }, res) => {
  try {
    const [S, D, name] = JSON.parse(Buffer.from(d, 'base64').toString());
    const rehydrated = D.reduce((newSchedule, daySchedule) => {
      daySchedule.forEach(item => {
        const [index, startMod, length] = item.split('|');
        const [title, body, sourceId] = S[index].split('|');
        newSchedule.push({
          startMod,
          length,
          endMod: startMod + length,
          title,
          body,
          sourceId,
        }); 
      });
    }, []);
    res.status(200).json({
      schedule: rehydrated,
      name,
    });
  } catch(error) {
    next(error);
  }
});

module.exports = api;