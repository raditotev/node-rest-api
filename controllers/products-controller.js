const createError = require('http-errors');

const Product = require('../models/product');

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({ message: 'Get all products', products });
  } catch (error) {
    console.log(error);
    next(createError(502, error.message));
  }
};

const createProduct = async (req, res, next) => {
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
};

const getProduct = (req, res, next) => {
  const id = req.params.productId;
  res.status(200).json({ message: `Get product with an ID ${id}` });
};

const updateProduct = (req, res, next) => {
  const id = req.params.productId;
  res.status(200).json({ message: `Update product with an ID of ${id}` });
};

const deleteProduct = (req, res, next) => {
  const id = req.params.productId;
  res.status(200).json({ message: `Delete product with an ID of ${id}` });
};

module.exports = {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
};
