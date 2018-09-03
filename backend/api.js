const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { requiresAuth, dateTypeKeys } = require('./util.js');
const api = new Router();

/* Login endpoint */
api.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await req.db.collection('users').findOne({ username }) || {};
    const auth = await bcrypt.compare(password, user.password);

    if (!user || !auth) {
      res.status(401).json({
        auth: false,
        token: null,
      });
      return;
    }

    const { _id: id, admin } = user;
    jwt.sign({ id, admin }, process.env.SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) {
        next(err);
        return;
      }
      res.status(200).json({
        auth: true,
        token,
      });
    });
  } catch(error) {
    next(error);
  }
});

/* Verify token for client-side routing */
api.post('/verify', async (req, res, next) => {
  const { token } = req.body;
  jwt.verify(token, process.env.SECRET, (err, user) => {
    if (!err && user) res.status(200).json({ auth: true, user })
    else res.status(401).json({ auth: false, msg: err.name });
  });
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

module.exports = api;