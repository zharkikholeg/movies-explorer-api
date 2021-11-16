const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const validator = require('validator');
const { celebrate, Joi } = require('celebrate');
const cors = require('cors');
const usersRoute = require('./routes/users');
const moviesRoute = require('./routes/movies');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const errors = require('./middlewares/errors');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { NODE_ENV, DB_ADDRESS } = process.env;
const db = NODE_ENV === 'production' ? DB_ADDRESS : 'mongodb://localhost:27017/moviesdb';

const app = express();
const port = 3000;

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(db, {
  useNewUrlParser: true,
  autoIndex: true,
});

app.use(requestLogger); // логгер запросов

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().min(2).max(30).required(),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().min(2).max(30).required(),
    name: Joi.string().min(2).max(30).required(),
  }),
}), createUser);

app.use(auth);

app.use('/users', usersRoute);
app.use('/movies', moviesRoute);

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
