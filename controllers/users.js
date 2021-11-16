const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  // хешируем пароль
  bcrypt.hash(password, 10)
    .then((password) => {
      User.create({
        name, email, password,
      })
        .then((user) => {
          const newUser = user.toObject();
          delete newUser.password;
          res.send(newUser);
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            const err = new Error('Переданы некорректные данные при создании пользователя');
            err.statusCode = 400;
            return next(err);
          }
          if (err.message === 'Validation failed') {
            const err = new Error('Переданы некорректные данные при создании пользователя');
            err.statusCode = 400;
            return next(err);
          }
          if (err.name === 'MongoServerError') {
            const err = new Error('При регистрации указан email, который уже существует на сервере');
            err.statusCode = 409;
            return next(err);
          }
          const err2 = new Error('На сервере произошла ошибка');
          err2.statusCode = 500;
          return next(err2);
        })
        .catch(next);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  let userId;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        // return res.status(401).send({ message: 'Неправильные почта или пароль' });
        const err = new Error('Неправильные почта или пароль');
        err.statusCode = 401;
        return next(err);
      }
      userId = user._id;
      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        const err = new Error('Неправильные почта или пароль');
        err.statusCode = 401;
        return next(err);
      }

      // аутентификация успешна
      const token = jwt.sign(
        { _id: userId },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );

      res.send({ token });
    })
    .catch(next);
};

module.exports.getUserMe = (req, res, next) => {
  // console.log("called")
  const id = req.user._id;
  // console.log(id);

  User.find({ _id: id })
    .then((user) => {
      // console.log("called 2")
      if (user) {
        res.send(user);
      } else {
        // return res.status(404).send({ message: 'Пользователь по указанному _id не найден' });
        const err = new Error('Пользователь по указанному _id не найден');
        err.statusCode = 404;
        return next(err);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const err = new Error('Пользователь по указанному _id не найден');
        err.statusCode = 404;
        return next(err);
      }
      res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.updateUser = (req, res, next) => {
  const userId = req.user._id;
  const { name, email } = req.body;
  console.log(name);

  User.findByIdAndUpdate(userId, { name, email }, { new: true, runValidators: true })
    .then((user) => {
      // console.log(user);
      if (user) {
        res.send(user);
      } else {
        const err = new Error('Пользователь по указанному _id не найден');
        err.statusCode = 400;
        return next(err);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const err = new Error('Пользователь по указанному _id не найден');
        err.statusCode = 400;
        return next(err);
      }
      if (err.name === 'ValidationError') {
        const err = new Error('Переданы некорректные данные при обновлении профиля');
        err.statusCode = 400;
        return next(err);
      }
      const err2 = new Error('На сервере произошла ошибка');
      err2.statusCode = 500;
      return next(err2);
    })
    .catch(next);
};
