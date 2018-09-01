const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

const api = require('./api.js');
const { mongo, log } = require('./util.js');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

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
app.get('/dates', async (req, res, next) => {
  try {
    const { dates = [] } = await req.db.collection('dates').findOne({}) || {};
    res.json(dates);
  } catch (error) {
    next(error);
  }
});

// < v2.0-b6 SUPPORT
app.get('/otherDates', async (req, res, next) => {
  try {
    const yearRange = getYearRange();
    const dates = (await req.db.collection('otherDates').findOne({}))[yearRange];
    res.status(200).json(dates);
  } catch (error) {
    next(error);
  }
});

app.get('/specialDates', async (req, res) => {
  for (const i of Array(4).fill()) {
    // TODO: Collect all dates
  }
});

// Redirect server-side 404s back to client-side router
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../dist/index.html'));
});

// Global error handler
app.use((err, { route }, res, next) => {
  const methods = Object.keys(route.methods).map(m  => m.toUpperCase()).join(' ');
  log(methods, route.path, err);
  res.status(500).send('Something went wrong :(');
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});



