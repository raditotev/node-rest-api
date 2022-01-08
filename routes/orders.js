const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.status(200).json({ message: 'GET all orders' });
});

router.post('/', (req, res, next) => {
  const { pid, quantity } = req.body;
  const order = { pid, quantity };
  res.status(201).json({ message: 'Created new order', order });
});

router.get('/:orderId', (req, res, next) => {
  const { orderId } = req.params;
  res.status(200).json({ message: `GET order with id ${orderId}` });
});

router.delete('/:orderId', (req, res, next) => {
  const { orderId } = req.params;
  res.status(200).json({ message: `DELETE order with id ${orderId}` });
});

module.exports = router;
