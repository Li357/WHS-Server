const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

let db;

MongoClient.connect(process.env.PROD_MONGODB, (err, database) => {
  if(err) throw err;
  db = database.db('whs');

  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
});

app.get('/dates', (req, res) => {
  db.collection('dates').findOne({}, (err, docs) => {
    if(err) throw err;
    res.json(docs.dates);
  });
});
