const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const {
  updateUser, getUserMe,
} = require('../controllers/users');

router.get('/me', getUserMe);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email({ tlds: { allow: false } }),
    name: Joi.string().min(2).max(30),
  }),
}), updateUser);

module.exports = router;
