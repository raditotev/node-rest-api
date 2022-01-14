const express = require('express');
const multer = require('multer');
const { check } = require('express-validator');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'tmp/');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  const mimetype = file.mimetype;
  if (
    mimetype === 'image/png' ||
    mimetype === 'image/jpg' ||
    mimetype === 'image/jpeg' ||
    mimetype === 'image/gif'
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Unsupported file type. Supported types: jpeg, jpg, gif and png'
      )
    );
  }
};
const limits = {
  fileSize: 1024 * 1024 * 3,
};
const upload = multer({ storage, fileFilter, limits });

const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/products-controller');

const validateProductInput = [
  check('name', 'Please provide product name').notEmpty(),
  check('price', 'Please provide product price').isInt({ min: 1 }),
];

router.get('/', getProducts);

router.post('/', validateProductInput, upload.single('image'), createProduct);

router.get('/:productId', check('productId').isMongoId(), getProduct);

router.patch('/:productId', check('productId').isMongoId(), updateProduct);

router.delete('/:productId', check('productId').isMongoId(), deleteProduct);

module.exports = router;
