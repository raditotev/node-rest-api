import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { validationResult } from 'express-validator';

import User from '../models/user';

const createUser = async (req: Request, res: Response, next: NextFunction) => {
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
    const message = error instanceof Error ? error.message : 'Unknown';
    return next(createError(502, message));
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
    const message = error instanceof Error ? error.message : 'Unknown';
    next(createError(502, message));
  }
};

const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(401, 'Invalid credentials'));
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return next(createError(401, 'Invalid credentials'));
    }

    const payload = { userId: user._id, email };
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(payload, secret!, { expiresIn: '1h' });

    res.status(200).json({ message: 'Successful login', token });
  } catch (error) {
    console.log(error);
    const message = error instanceof Error ? error.message : 'Unknown';
    next(createError(502, message));
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
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
    const message = error instanceof Error ? error.message : 'Unknown';
    next(createError(502, message));
  }
};

export { createUser, authenticateUser, deleteUser };
