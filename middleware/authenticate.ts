import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import express from 'express';

export default (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.headers.authorization.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.payload = decoded;
  } catch (error) {
    console.log(error);
    return next(new createError.Unauthorized());
  }

  next();
};
