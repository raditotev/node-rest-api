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

const getProduct = async (req, res, next) => {
  const id = req.params.productId;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return next(createError(422, 'This product ID does not exists'));
    }
    res.status(200).json({ message: `Get product with an ID ${id}`, product });
  } catch (error) {
    console.log(error);
    next(createError(502, error.message));
  }
};

const updateProduct = async (req, res, next) => {
  const id = req.params.productId;
  const { name, price } = req.body;

  let product;
  try {
    product = await Product.findById(id);
  } catch (error) {
    console.log(error);
    return next(createError(502, error.message));
  }

  if (!product) {
    return next(createError(422, 'This product ID does not exists'));
  }

  product.name = name ? name : product.name;
  product.price = price ? price : product.price;

  try {
    await product.save();
    res
      .status(200)
      .json({ message: `Update product with an ID of ${id}`, product });
  } catch (error) {
    console.log(error);
    next(createError(502, error.message));
  }
};

const deleteProduct = async (req, res, next) => {
  const id = req.params.productId;

  let product;
  try {
    product = await Product.findById(id);
  } catch (error) {
    console.log(error);
    return next(createError(502, error.message));
  }

  if (!product) {
    return next(createError(422, 'This product ID does not exists'));
  }

  try {
    await product.remove();
    res.status(200).json({ message: `Delete product with an ID of ${id}` });
  } catch (error) {
    console.log(error);
    return next(createError(502, error.message));
  }
};

module.exports = {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
};
