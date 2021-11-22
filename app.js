const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi } = require('celebrate');
const cors = require('cors');
const usersRoute = require('./routes/users');
const moviesRoute = require('./routes/movies');
const auth = require('./middlewares/auth');
const errors = require('./middlewares/errors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const helmet = require('helmet');

require('dotenv').config();

const db = process.env.NODE_ENV === 'production' ? process.env.DB_ADDRESS : 'mongodb://localhost:27017/moviesdb';

const app = express();
const port = 3000;

app.use(helmet());
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(db, {
  useNewUrlParser: true,
  autoIndex: true,
});

app.use(requestLogger); // логгер запросов

app.use(require('./routes/index'))

app.all('*', (req, res, next) => {
  const err = new Error('Ресурс не найден');
  err.statusCode = 404;
  return next(err);
});

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
