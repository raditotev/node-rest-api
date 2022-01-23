const express = require('express');
const morgan = require('morgan');
const createError = require('http-errors');
const bodyParser = require('body-parser');

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const authenticate = require('./middleware/authenticate');

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

// Non existing routes
app.use((req, res, next) => {
  const error = new createError.NotFound();
  next(error);
});
// Error handling
app.use((error, req, res, next) => {
  res
    .status(error.status || 500)
    .json({ message: error.message || 'Server error' });
});

module.exports = app;
