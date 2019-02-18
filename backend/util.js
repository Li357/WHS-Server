const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

const dateTypeKeys = {
  1: 'assemblyDates',
  2: 'noSchoolDates',
  3: 'lateStartDates',
  4: 'earlyDismissalDates',
};

function log(method, route, error) {
  console.error(new Date(), method, route, error);
}

function mongo(dbURL, dbName) {
  return async function mongoMiddleware(req, res, next) {
    try {
      const database = await MongoClient.connect(dbURL);
      req.db = database.db(dbName);
      next();
    } catch (error) {
      log(error, 'Connecting to database', new Date());
      next(error);
    }
  };
}

function requiresAuth(callback) {
  return function authMiddleware(req, res, next) {
    const { signature, payload } = req.cookies;
    const token = `${payload}.${signature}`;
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (!err && decoded && callback(decoded)) next();
      else res.status(401).json({ auth: false, msg: err.name });
    });
  };
}

// eslint-ignore-next-line no-unused-vars
function errorHandler(err, { route }, res, next) { // next needed for error handling signature
  const methods = Object.keys(route.methods).map(m => m.toUpperCase()).join(' ');
  log(methods, route.path, err);
  res.status(500).send('Something went wrong :(');
}

module.exports = {
  mongo, requiresAuth, errorHandler, log, dateTypeKeys,
};
