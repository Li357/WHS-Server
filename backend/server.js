const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

const api = require('./api.js');
const { mongo, errorHandler, log } = require('./util.js');
const legacyAPI = require('./legacy-api.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(mongo(process.env.PROD_MONGODB, 'whs'));

app.use('/v1/api', api);
app.use(legacyAPI);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '../dist')));
} else {
  app.use(cors());
}

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../dist/index.html'));
});

app.use(errorHandler);

app.listen(PORT, () => {
  log(`Server running on ${PORT}`);
});

