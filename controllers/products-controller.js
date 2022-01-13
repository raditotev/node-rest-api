const fs = require('fs/promises');
const createError = require('http-errors');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const storage = require('../firestore');
const Product = require('../models/product');

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().select('_id name price');
    res.status(200).json({
      message: 'Get all products',
      products: products,
    });
  } catch (error) {
    console.log(error);
    next(createError(502, error.message));
  }
};

const createProduct = async (req, res, next) => {
  const { name, price } = req.body;

  let imageURL;
  if (req.file) {
    try {
      const file = await fs.readFile(req.file.path);
      const imageRef = ref(storage, 'products/' + req.file.filename);
      const snapshot = await uploadBytes(imageRef, file);
      imageURL = await getDownloadURL(snapshot.ref);
      fs.unlink(req.file.path);
    } catch (error) {
      return next(createError(502, error.message));
    }
  }

  const product = new Product({
    name,
    price,
    ...(imageURL && { image: imageURL }),
  });

  try {
    await product.save();
    res.status(201).json({
      message: 'Created a new product',
      product: { _id: product.id, name, price, imageURL: product.image },
    });
  } catch (error) {
    console.log(error);
    next(createError(502, error.message));
  }
};

const getProduct = async (req, res, next) => {
  const id = req.params.productId;
  try {
    const product = await Product.findById(id).select('_id name price');
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

  try {
    const product = await Product.findById(id);

    if (!product) {
      return next(createError(422, 'This product ID does not exists'));
    }

    product.name = name ? name : product.name;
    product.price = price ? price : product.price;

    await product.save();
    res.status(200).json({
      message: `Update product with an ID of ${id}`,
      product: { id, name, price },
    });
  } catch (error) {
    console.log(error);
    return next(createError(502, error.message));
  }
};

const deleteProduct = async (req, res, next) => {
  const id = req.params.productId;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return next(createError(422, 'This product ID does not exists'));
    }

    await product.remove();
    res.status(200).json({ message: 'Product deleted' });
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
