const { Router } = require('express');
const moment = require('moment');

const { dateTypeKeys } = require('./util.js');

const legacyAPI = new Router();

// < v2.0-b6 SUPPORT
legacyAPI.get('/otherDates', async (req, res, next) => {
  const yearRange = '18-19';
  const dates = (await req.db.collection('otherDates').findOne({}))[yearRange];
  res.status(200).json(dates);
});

// < v2.0-b6 SUPPORT
legacyAPI.get('/specialDates', async (req, res, next) => {
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
  Object.keys(settings).forEach((key) => {
    settings[key] = moment(settings[key]).format('MMMM D YYYY');
  });

  res.status(200).json({
    assemblyDates: asm,
    otherNoSchoolDates: [],
    noSchoolDates: nos,
    lateStartDates: lts,
    earlyDismissalDates: ead,
    ...settings,
  });
});

// 2.x SUPPORT
legacyAPI.get('/api/specialDates', async ({ db, query: { type: dateType, year, onlyDates } }, res, next) => {
  if (!dateType && year) {
    const docs = await db.collection('specialDates').find({ year }).toArray();

    // Request for only dates by app
    if (onlyDates) {
      const specialDates = docs.reduce((datesDict, { type, dates, settings }) => {
        if (type === '5') {
          return {
            ...datesDict,
            ...settings,
          };
        }

        // eslint-disable-next-line no-param-reassign
        datesDict[dateTypeKeys[type]] = [
          ...datesDict[dateTypeKeys[type]] || [],
          ...dates.map(obj => obj.date),
        ];
        return datesDict;
      }, {});
      res.status(200).json(specialDates);
      return;
    }

    res.status(200).json(docs);
    return;
  }

  const doc = await db.collection('specialDates').findOne({ type: dateType, year });
  res.status(200).json(doc);
});

module.exports = legacyAPI;
