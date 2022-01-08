const express = require('express');
const app = express();
const morgan = require('morgan');
const createError = require('http-errors');
const bodyParser = require('body-parser');

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

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

app.listen(3000);
