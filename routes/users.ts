const { Router } = require('express');
const { check } = require('express-validator');

const {
  createUser,
  authenticateUser,
  deleteUser,
} = require('../controllers/users-controller');

const router = Router();

const validateInput = [
  check('email', 'Please enter valid email').normalizeEmail().isEmail(),
  check('password', 'Password should be at least 6 characters long ').isLength({
    min: 6,
  }),
];

router.post('/signup', validateInput, createUser);

router.post('/login', validateInput, authenticateUser);

router.delete('/:uid', check('uid').isMongoId(), deleteUser);

module.exports = router;
