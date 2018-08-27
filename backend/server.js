const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const api = require('./api.js');
const mongo = require('./mongo.js');

const app = express();
const PORT = process.env.PORT || 5000;

if(process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '../dist')));
} else {
  app.use(cors());
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(mongo(process.env.PROD_MONGODB, 'whs'));

app.use('/api', api);

/* LEGACY ENDPOINTS FOR OLD APP SUPPORT - TO BE REMOVED */

/*
 * Roadmap:
 * 1. Finish app server frontend UI with new API endpoints
 * 2. Implement redirects for legacy endpoints (for v2.0-b6 and under)
 * 3. Update app to use new API scheme
 * 4. Remove legacy endpoints
 */

// v1.x SUPPORT - TO BE REMOVED ASAP
app.get('/dates', async (req, res) => {
  try {
    const { dates = [] } = await req.db.collection('dates').findOne({}) || {};
    res.json(dates);
  } catch(error) {
    console.log(err, 'GET Endpoint /dates', new Date());
    res.status(400).json(JSON.stringify(error));
  }
});

// < v2.0-b6 SUPPORT
app.get('/otherDates', async (req, res) => {
  try {
    const yearRange = getYearRange();
    const dates = (await req.db.collection('otherDates').findOne({}))[yearRange];
    res.status(200).json(dates);
  } catch (error) {
    console.log(error, 'GET Endpoint /otherDates', new Date());
    res.status(400).json(JSON.stringify(error));
  }
});

app.get('/specialDates', async (req, res) => {
  // TODO: Redirect to /api/specialDates and iterate thru all date types and collect/send to client
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});



