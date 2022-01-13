const express = require('express');
const multer = require('multer');

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

const productsController = require('../controllers/products-controller');

router.get('/', productsController.getProducts);

router.post('/', upload.single('image'), productsController.createProduct);

router.get('/:productId', productsController.getProduct);

router.patch('/:productId', productsController.updateProduct);

router.delete('/:productId', productsController.deleteProduct);

module.exports = router;
