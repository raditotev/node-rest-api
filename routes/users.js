const bcrypt = require('bcryptjs');
const createError = require('http-errors');
const { Router } = require('express');
const User = require('../models/user');
const { check, validationResult } = require('express-validator');

const router = Router();

const validateInput = [
  check('email', 'Please enter valid email').normalizeEmail().isEmail(),
  check('password', 'Password should be at least 6 characters long ').isLength({
    min: 6,
  }),
];

router.post('/signup', validateInput, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      return next(createError(409, 'User with this email already exists'));
    }
  } catch (error) {
    console.log(error);
    return next(createError(502, error.message));
  }
  const hash = bcrypt.hashSync(password, 10);

  const user = new User({
    email,
    password: hash,
  });

  try {
    await user.save();
    res.status(201).json({ message: 'New user created' });
  } catch (error) {
    console.log(error);
    next(createError(502, error.message));
  }
});

router.delete('/:uid', check('uid').isMongoId(), async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      createError(400, 'Provide user ID as a parameter: users/{user-id}')
    );
  }

  const id = req.params.uid;

  try {
    const user = await User.findById(id);
    if (!user) {
      return next(createError(422, 'Could not find user with this ID'));
    }

    await user.remove();
    res.status(200).json({ message: 'User removed' });
  } catch (error) {
    console.log(error);
    next(createError(502, error.message));
  }
});

module.exports = router;
