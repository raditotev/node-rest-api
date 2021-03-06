import fs from 'fs';
import express from 'express';
import multer from 'multer';
import { check } from 'express-validator';
import createError from 'http-errors';

import authenticate from '../middleware/authenticate';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'tmp/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + '-' + file.originalname);
  },
});
const fileFilter = (
  req: express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
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
      createError(
        415,
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
  check('price', 'Please provide product price').isFloat({ min: 0.01 }),
];

router.get('/', getProducts);

router.post(
  '/',
  authenticate,
  upload.single('image'),
  validateProductInput,
  createProduct
);

router.get('/:productId', check('productId').isMongoId(), getProduct);

router.patch(
  '/:productId',
  authenticate,
  upload.single('image'),
  check('productId').isMongoId(),
  updateProduct
);

router.delete(
  '/:productId',
  authenticate,
  check('productId').isMongoId(),
  deleteProduct
);

export default router;
