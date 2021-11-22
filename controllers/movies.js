const Movie = require('../models/movie');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  // console.log(req.body);
  const {
    country, director, duration, year, description, image, trailer, nameRU, nameEN, thumbnail, movieId,
  } = req.body;
  const owner = req.user._id;

  Movie.create({
    country, director, duration, year, description, image, trailer, nameRU, nameEN, thumbnail, movieId, owner,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const err = new Error('Переданы некорректные данные при создании фильма');
        err.statusCode = 400;
        return next(err);
      }
      const err2 = new Error('На сервере произошла ошибка');
      err2.statusCode = 500;
      return next(err2);
    })
    .catch(next);
};

module.exports.deleteMovie = (req, res, next) => {
  const reqId = req.user._id;
  Movie.findById({
    _id: req.params.movieId,
    owner: reqId,
  })
    .then((movie) => {
      if (!movie) {
        const err = new Error('Фильм с указанным _id не найден');
        err.statusCode = 404;
        return next(err);
      }
      if (movie.owner.toString() === reqId) {
        Movie.findOneAndRemove({
          _id: req.params.movieId,
          owner: reqId,
        })
          .then((movieResult) => {
            res.send(movieResult);
          })
          .catch(next);
      } else {
        const err = new Error('Вы не являетесь владельцем этого фильма');
        err.statusCode = 403;
        return next(err);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        // return res.status(400).send({ message: 'Карточка с указанным _id не найдена' });
        const err = new Error('Фильм с указанным _id не найден');
        err.statusCode = 404;
        return next(err);
      }
      if (err.name === 'NotFound') {
        const err = new Error('Фильм с указанным _id не найден');
        err.statusCode = 404;
        return next(err);
      }
      const err2 = new Error('На сервере произошла ошибка');
      err2.statusCode = 500;
      return next(err2);
    })
    .catch(next);
};
