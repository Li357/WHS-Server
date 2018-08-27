const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const api = new Router();

/* Login endpoint */
api.post('/login', async (req, res) => {
  try {
    const { password } = await req.db.collection('users').findOne({ username: 'admin' });
    const isAdmin = await bcrypt.compare(req.body.password, password);

    if (isAdmin) {
      const token = jwt.sign({ user: 'admin' }, process.env.SECRET, { expiresIn: '7d' });
      res.status(200).json({
        auth: true,
        token,
      });
    } else {
      res.status(400).send({
        auth: false,
        token: null,
      });
    }
  } catch(error) {
    console.log(error, 'POST Endpoint /login', new Date());
    res.status(400).json(JSON.stringify(error));
  }
});

api.get('/specialDates', async ({ db, query: { type, year } }, res) => {
  try {
    const doc = await db.collection('specialDates').findOne({ type, year });
    res.status(200).json(doc);
  } catch(error) {
    console.log(error, 'GET Endpoint /specialDates', new Date());
    res.status(400).json(JSON.stringify(error));
  }
});

api.post('/specialDates', async ({ db, body, query: { type, year } }, res) => {
  try {
    console.log(body);
    await db.collection('specialDates').update(
      { type, year }, 
      { $set: { dates: body.dates } }, 
      { upsert: true },
    );
    res.status(200).end();
  } catch(error) {
    console.log(error, 'POST Endpoint /specialDates', new Date());
    res.status(400).json(JSON.stringify(error));
  }
});

module.exports = api;