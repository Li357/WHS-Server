const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { requiresAuth } = require('./util.js');

const authRouter = new Router();

/* Login endpoint for admin */
const isProduction = process.env.NODE_ENV === 'production';
authRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  const user = await req.db.collection('users').findOne({ username });
  if (!user) {
    return res.status(401).json({ auth: false });
  }

  const auth = await bcrypt.compare(password, user.password);
  if (!auth) {
    return res.status(401).json({ auth: false });
  }

  const { _id: id, admin } = user;
  jwt.sign({ id, admin }, process.env.SECRET, { expiresIn: '1d' }, (err, token) => {
    if (err) {
      return next(err);
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
});

authRouter.post(
  '/specialDates',
  requiresAuth(user => user.admin),
  async ({ db, body, query: { type, year } }, res, next) => {
    const set = body.dates ? { dates: body.dates } : { settings: body.settings };
    await db.collection('specialDates').update(
      { type, year },
      { $set: set },
      { upsert: true },
    );
    res.status(200).json({ auth: true });
  },
);

module.exports = authRouter;
