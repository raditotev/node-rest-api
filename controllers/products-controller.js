const fs = require('fs/promises');
const createError = require('http-errors');
const {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} = require('firebase/storage');
const { validationResult } = require('express-validator');

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, price } = req.body;

  let imageURL;
  if (req.file) {
    try {
      const file = await fs.readFile(req.file.path);
      const imageRef = ref(storage, 'products/' + req.file.filename);
      const snapshot = await uploadBytes(imageRef, file);
      imageURL = await getDownloadURL(snapshot.ref);
    } catch (error) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        return next(
          createError(
            502,
            'Failed to upload file with error:\n' +
              error.message +
              '\nFailed to delete file from disk with error:\n' +
              err.message
          )
        );
      }
      return next(createError(502, error.message));
    }
    try {
      await fs.unlink(req.file.path);
    } catch (error) {
      // Deleting file from disk is not important as long it's updated to storage
      console.log(error);
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
      product: { _id: product.id, name, price: +price, imageURL },
    });
  } catch (error) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {}
      return next(
        createError(
          502,
          'Failed to create product with error:\n' +
            error.message +
            '\nFailed ot delete uploaded file with error:\n' +
            err.message
        )
      );
    }
    next(createError(502, error.message));
  }
};

const getProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(400, 'Invalid product ID'));
  }

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(400, 'Invalid product ID'));
  }

  const id = req.params.productId;
  const { name, price } = req.body;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return next(createError(422, 'This product ID does not exists'));
    }

    let imageURL;
    if (req.file) {
      if (product.image) {
        const filename = product.image.match(
          /\d{13}-\w+.(png|gif|jpeg|fpg)/
        )[0];

        const existingImageRef = ref(storage, `products/${filename}`);
        await deleteObject(existingImageRef);
      }

      const file = await fs.readFile(req.file.path);
      const imageRef = ref(storage, 'products/' + req.file.filename);
      const snapshot = await uploadBytes(imageRef, file);
      imageURL = await getDownloadURL(snapshot.ref);

      try {
        fs.unlink(req.file.path);
      } catch (error) {
        // Deleting file from disk is not important as long it's uploaded to storage
        console.log(error);
      }
    }

    product.name = name ? name : product.name;
    product.price = price ? price : product.price;
    product.image = imageURL ? imageURL : product.image;

    await product.save();
    res.status(200).json({
      message: `Update product with an ID of ${id}`,
      product: { id: product.id, name, price: +price, image: product.image },
    });
  } catch (error) {
    console.log(error);
    return next(createError(502, error.message));
  }
};

const deleteProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(400, 'Invalid product ID'));
  }

  const id = req.params.productId;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return next(createError(422, 'This product ID does not exists'));
    }

    if (product.image) {
      const filename = product.image.match(/\d{13}-\w+.(png|gif|jpeg|fpg)/)[0];

      const imageRef = ref(storage, `products/${filename}`);
      await deleteObject(imageRef);
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
