const { Router } = require('express');

const authRouter = require('./auth');

const api = new Router();

api.use(authRouter);

api.get('/specialDates', () => {
  // TODO
});

module.exports = api;
