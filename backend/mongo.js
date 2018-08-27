const { MongoClient } = require('mongodb');

module.exports = function mongo(dbURL, dbName) {
  return function mongoMiddleware(req, res, next) {
    MongoClient.connect(dbURL, (err, database) => {
      if(err) {
        console.log(err, 'Connecting to database', new Date());
        next(err);
      } else {
        req.db = database.db(dbName);
        next();
      }
    });
  }
}