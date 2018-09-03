const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

const dateTypeKeys = {
  1: 'assemblyDates',
  2: 'noSchoolDates',
  3: 'lateStartDates',
  4: 'earlyDismissalDates',
};

function mongo(dbURL, dbName) {
  return async function mongoMiddleware(req, res, next) {
    try {
      const database = await MongoClient.connect(dbURL);
      req.db = database.db(dbName);
      next();
    } catch (error) {
      console.log(error, 'Connecting to database', new Date());
      next(error);
    }
  }
}

function hasAuthHeader(headers) {
  return headers && headers.authorization;
}

function requiresAuth(callback) {
  return function authMiddleware(req, res, next) {
    if (hasAuthHeader(req.headers)) {
      const [type, token] = req.headers.authorization.split(' ');
      if (type === 'JWT') {
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
          if (!err && decoded && callback(decoded)) next();
          else res.status(401).json({ auth: false, msg: err.name });
        });
      }
    }
  }
}

function log(method, route, error) {
  console.error(new Date(), method, route, error);
} 

module.exports = { mongo, requiresAuth, log, dateTypeKeys };