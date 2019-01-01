const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const { inflate } = require('pako');

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
  } catch (error) {
    next(error);
  }
});

api.get('/specialDates', async ({ db, query: { type: dateType, year, onlyDates } }, res, next) => {
  try {
    if (!dateType && year) {
      const docs = await db.collection('specialDates').find({ year }).toArray();

      // Request for only dates by app
      if (onlyDates) {
        const specialDates = docs.reduce((datesDict, { type, dates, settings }) => {
          if (type === '5') {
            return {
              ...datesDict,
              ...settings,
            };
          }

          // eslint-disable-next-line no-param-reassign
          datesDict[dateTypeKeys[type]] = [
            ...datesDict[dateTypeKeys[type]] || [],
            ...dates.map(obj => obj.date),
          ];
          return datesDict;
        }, {});
        res.status(200).json(specialDates);
        return;
      }

      res.status(200).json(docs);
      return;
    }

    const doc = await db.collection('specialDates').findOne({ type: dateType, year });
    res.status(200).json(doc);
  } catch (error) {
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
  } catch (error) {
    next(error);
  }
});

const { BITLY_ACCESS_TOKEN } = process.env;
const hostname = 'whs-server.herokuapp.com';
const urlPrefix = `https://${hostname}/?d=`;

api.post('/shorten', async ({ query: { d } }, res, next) => {
  try {
    const response = await fetch(
      'https://api-ssl.bitly.com/v4/shorten',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BITLY_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          long_url: `${urlPrefix}${d}`,
        }),
      },
    );
    const { id } = await response.json();
    res.status(200).json({ id });
  } catch (error) {
    next(error);
  }
});

// Endpoint to rehydrate schedule, see WHS/src/util/qr.js for compression
api.get('/expand', async ({ query: { id } }, res, next) => {
  try {
    const response = await fetch(
      'https://api-ssl.bitly.com/v4/expand',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BITLY_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          bitlink_id: id,
        }),
      },
    );
    const { long_url: longURL } = await response.json();
    const d = longURL.substring(urlPrefix.length);
    const jsonString = inflate(Buffer.from(d, 'base64'), { to: 'string' });

    const [S, D, name] = JSON.parse(jsonString);
    const rehydrated = D.reduce((newSchedule, daySchedule, dayIndex) => {
      daySchedule.forEach((item) => {
        const [index, startMod, length] = item.split('|').map(Number);
        const [title, body, sourceId] = S[index].split('|');
        newSchedule.push({
          startMod,
          length,
          endMod: startMod + length,
          title,
          body,
          sourceId: Number(sourceId),
          day: dayIndex + 1,
        });
      });
      return newSchedule;
    }, []);
    res.status(200).json({
      schedule: rehydrated,
      name,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = api;
