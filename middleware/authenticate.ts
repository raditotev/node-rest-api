import jwt from 'jsonwebtoken'
import createError from 'http-errors';


export default = (req, res, next) => {
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
