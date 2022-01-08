const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.status(200).json({ message: 'Get all products' });
});

router.post('/', (req, res, next) => {
  const { name, price } = req.body;
  const product = {
    name,
    price,
  };
  res.status(201).json({ message: 'Created a new product', product });
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
