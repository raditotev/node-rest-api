import jwt, { JwtPayload } from 'jsonwebtoken';
import createError from 'http-errors';
import express from 'express';

type UserData = {
  userId: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      payload: UserData;
    }
  }
}

export default (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.headers.authorization) {
    return next();
  }

  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserData;
    req.payload = decoded;
  } catch (error) {
    console.log(error);
    return next(new createError.Unauthorized());
  }

  next();
};
