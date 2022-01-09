const express = require('express');
const createError = require('http-errors');

const Order = require('../models/order');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find();
    res.status(200).json({ message: 'GET all orders', orders });
  } catch (error) {
    console.log(error);
    next(createError(502, error.message));
  }
});

router.post('/', async (req, res, next) => {
  const { pid, quantity } = req.body;
  const order = new Order({ pid, quantity });

  try {
    await order.save();
    res.status(201).json({ message: 'Created new order', order });
  } catch (error) {
    console.log(error);
    next(createError(502, error.message));
  }
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
