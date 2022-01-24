import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { validationResult } from 'express-validator';

import storage from '../firestore';
import Product from '../models/product';

const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find().select('_id name price');
    res.status(200).json({
      message: 'Get all products',
      products: products,
    });
  } catch (error) {
    console.log(error);
    const message = error instanceof Error ? error.message : 'Unknown';
    next(createError(502, message));
  }
};

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, price } = req.body;

  let imageURL;
  if (req.file) {
    try {
      const file = fs.readFileSync(req.file.path);
      const imageRef = ref(storage, 'products/' + req.file.filename);
      const snapshot = await uploadBytes(imageRef, file);
      imageURL = await getDownloadURL(snapshot.ref);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown';
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        const unlinkErrorMessage =
          err instanceof Error ? err.message : 'Unknown';
        return next(
          createError(
            502,
            'Failed to upload file with error:\n' +
              message +
              '\nFailed to delete file from disk with error:\n' +
              unlinkErrorMessage
          )
        );
      }
      return next(createError(502, message));
    }
    try {
      fs.unlinkSync(req.file.path);
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
    const message = error instanceof Error ? error.message : 'Unknown';
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        const unlinkErrorMessage =
          err instanceof Error ? err.message : 'Unknown';
        return next(
          createError(
            502,
            'Failed to create product with error:\n' +
              message +
              '\nFailed ot delete uploaded file with error:\n' +
              unlinkErrorMessage
          )
        );
      }
    }
    next(createError(502, message));
  }
};

const getProduct = async (req: Request, res: Response, next: NextFunction) => {
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
    const message = error instanceof Error ? error.message : 'Unknown';
    next(createError(502, message));
  }
};

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
        const match = product.image.match(/\d{13}-\w+.(png|gif|jpeg|fpg)/);
        const filename = match ? match[0] : null;

        if (filename) {
          const existingImageRef = ref(storage, `products/${filename}`);
          await deleteObject(existingImageRef);
        }
      }

      const file = fs.readFileSync(req.file.path);
      const imageRef = ref(storage, 'products/' + req.file.filename);
      const snapshot = await uploadBytes(imageRef, file);
      imageURL = await getDownloadURL(snapshot.ref);

      try {
        // No point in waiting to finish, therefore asynchronous
        fs.unlink(req.file.path, () => {});
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
    const message = error instanceof Error ? error.message : 'Unknown';
    return next(createError(502, message));
  }
};

const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      const match = product.image.match(/\d{13}-\w+.(png|gif|jpeg|jpg)/);
      const filename = match ? match[0] : null;

      if (filename) {
        const imageRef = ref(storage, `products/${filename}`);
        await deleteObject(imageRef);
      }
    }

    await product.remove();
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    console.log(error);
    const message = error instanceof Error ? error.message : 'Unknown';
    return next(createError(502, message));
  }
};

export { getProducts, createProduct, getProduct, updateProduct, deleteProduct };
