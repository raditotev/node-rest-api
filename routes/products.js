const express = require('express');
const createError = require('http-errors');

const Product = require('../models/product');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({ message: 'Get all products', products });
  } catch (error) {
    console.log(error);
    next(createError(502, error.message));
  }
});

router.post('/', async (req, res, next) => {
  const { name, price } = req.body;
  const product = new Product({
    name,
    price,
  });

  try {
    await product.save();
    res.status(201).json({ message: 'Created a new product', product });
  } catch (error) {
    console.log(error);
    next(createError(502, error.message));
  }
});

router.get('/:productId', (req, res, next) => {
  const id = req.params.productId;
  res.status(200).json({ message: `Get product with an ID ${id}` });
});

router.patch('/:productId', (req, res, next) => {
  const id = req.params.productId;
  res.status(200).json({ message: `Update product with an ID of ${id}` });
});

router.delete('/:productId', (req, res, next) => {
  const id = req.params.productId;
  res.status(200).json({ message: `Delete product with an ID of ${id}` });
});

module.exports = router;
