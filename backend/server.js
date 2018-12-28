const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const moment = require('moment');

const api = require('./api.js');
const { mongo, log } = require('./util.js');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cookieParser());

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
 * 4. Deploy new API scheme
 * 5. Deploy app update
 * 6. Remove legacy endpoints
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
    const yearRange = '18-19';
    const dates = (await req.db.collection('otherDates').findOne({}))[yearRange];
    res.status(200).json(dates);
  } catch (error) {
    next(error);
  }
});

// < v2.0-b6 SUPPORT
app.get('/specialDates', async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const [asm, nos, lts, ead] = (await Promise.all(Array(4).fill().map((item, i) => (
      req.db.collection('specialDates').findOne({
        type: String(i + 1), 
        year: String(currentYear),
      })
    )))).map(doc => (doc ? doc.dates : []).map(dateObj => (
      moment(dateObj.date).format('MMMM D YYYY')
    )));

    const { settings } = await req.db.collection('specialDates').findOne({
      type: '5',
      year: String(currentYear),
    });
    for (const key in settings) {
      settings[key] = moment(settings[key]).format('MMMM D YYYY');
    }

    res.status(200).json({
      assemblyDates: asm,
      otherNoSchoolDates: [],
      noSchoolDates: nos,
      lateStartDates: lts,
      earlyDismissalDates: ead,
      ...settings,
    });
  } catch(error) {
    next(error);
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



