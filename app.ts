import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import createError, { HttpError } from 'http-errors';

import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import userRoutes from './routes/users';
import authenticate from './middleware/authenticate';

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    return res.status(200).json({});
  }
  next();
});

// Routes
app.use('/products', productRoutes);
app.use('/orders', authenticate, orderRoutes);
app.use('/users', userRoutes);
app.use('/status', (req: Request, res: Response) => {
  return res.status(200).send('Server up and running');
});

// Non existing routes
app.use((req: Request, res: Response, next: Function) => {
  const error = new createError.NotFound();
  return next(error);
});
// Error handling
app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
  res
    .status(error.status || 500)
    .json({ message: error.message || 'Server error' });
});

export default app;
