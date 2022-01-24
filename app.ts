import express from 'express';
import morgan from 'morgan';
import createError, { HttpError, HttpErrorConstructor } from 'http-errors';
import bodyParser from 'body-parser';

import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import userRoutes from './routes/users';
import authenticate from './middleware/authenticate';

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
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
app.use('/status', (req, res) => {
  return res.status(200).send('Server up and running');
});

// Non existing routes
app.use((req, res, next: express.NextFunction) => {
  const error = new createError.NotFound();
  next(error);
});
// Error handling
app.use((error: HttpError, req: express.Request, res: express.Response) => {
  res
    .status(error.status || 500)
    .json({ message: error.message || 'Server error' });
});

export default app;
