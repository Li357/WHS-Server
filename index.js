const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const moment = require('moment');
const crawler = require('crawler-request');
const { load } = require('cheerio');
const fetch = require('node-fetch');

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

app.get('/specialDates', async (req, res) => {
  try {
    const now = moment();
    const fullYear = now.year();
    const year = Number(String(fullYear).slice(-2, fullYear.length)); // Get last two numbers from year
    let lookFor;
    if(now.month() > 4) { // If after May (0-based)
      lookFor = `${year}-${year + 1}`; // i.e. in June 2018, years are 18-19
    } else {
      lookFor = `${year - 1}-${year}`; // i.e. in May 2018, years are 17-18
    }

    const calendarPage = await fetch('https://westside66.org/calendar/');
    const calendarPageHTML = await calendarPage.text();
    const $ = load(calendarPageHTML);
    const pdfLink = $('.frame > p > a')
      .map((i, el) => $(el).attr('href'))
      .toArray()
      .find(href => href.includes(lookFor) && href.includes('Student')); // Always get student calendar

    const { text } = await crawler(pdfLink);

    const noSchoolString = 'NO SCHOOL';
    const noSchoolIndex = text.indexOf(noSchoolString);
    const decemberIndex = text.indexOf(`December 20${lookFor.slice(0, 2)}`);
    // This assumes that December 20XX follows directly after dates list
    const monthRegex = '(January|February|March|April|May|August|September|October|November|December)';
    const dateRegex = new RegExp(`${monthRegex} [\\d-]+([ -]+${monthRegex} \\d+)?`, 'g');
    const dates = text.slice(noSchoolIndex + noSchoolString.length, decemberIndex)
      .trim()
      .match(dateRegex)
      .reduce((expanded, string) => {
        if (string.includes('-')) {
          const parts = string.split('-');
          // Handles cases like December 20 - January 4
          if (parts[1].match(/[A-Za-z]+/)) {
            // Assumes this only happens with spring or winter break
            const [firstDate, lastDate] = parts.map(part => part.trim().split(' '));

            return [
              ...expanded,
              ...rangeOfDates(...firstDate, 31), // December and March have 31 days
              ...rangeOfDates(lastDate[0], 1, lastDate[1]),
            ];
          }
          // Handles cases like March 18-22
          const [month, dayRange] = string.split(' ');
          return [...expanded, ...rangeOfDates(month, ...dayRange.split('-'))];
        }
        return [...expanded, string];
      }, []);

    const [semOne, semTwo, lastDay] = ['Semester 1: ', 'Semester 2: ', 'Last Day of School '].map(searchString => ({
      index: text.indexOf(searchString),
      length: searchString.length,
    }));

    const semOneDate = text.slice(semOne.index + semOne.length, semTwo.index).trim();

    // Plus 9 & 3 because January (7 chars) + 3 (space and 2 digits max)
    const semTwoSlice = semTwo.index + semTwo.length;
    const semTwoDate = text.slice(semTwoSlice, semTwoSlice + 10).trim();

    // Plus 3 & 3 because May (3 chars) + 3 (space and 2 digits max)
    const lastDaySlice = lastDay.index + lastDay.length;
    const lastDayDate = text.slice(lastDaySlice, lastDaySlice + 6).trim();

    res.status(200).json({
      semOneDate,
      semTwoDate,
      lastDayDate,
      noSchoolDates: dates,
    });
  } catch(error) {
    console.log(error, 'Endpoint /specialDates', new Date());
    res.status(400).json(JSON.stringify(error));
  }
});
