const express = require('express');
const app = express();
const morgan = require('morgan');
const createError = require('http-errors');

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

app.use(morgan('dev'));

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

app.use((req, res, next) => {
  const error = new createError.NotFound();
  next(error);
});

app.use((error, req, res, next) => {
  res
    .status(error.status || 500)
    .json({ message: error.message || 'Server error' });
});

app.listen(3000);
