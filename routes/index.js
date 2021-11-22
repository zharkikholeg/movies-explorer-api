const router = require('express').Router();
const auth = require('../middlewares/auth');
const usersRoute = require('./users');
const moviesRoute = require('./movies');

router.use(require('./signin'))
router.use(require('./signup'))


router.use(auth);

router.use(usersRoute);
router.use(moviesRoute);


module.exports = router;