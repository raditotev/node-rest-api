const createError = require('http-errors');

const Order = require('../models/order');

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find();
    res.status(200).json({ message: 'GET all orders', orders });
  } catch (error) {
    console.log(error);
    next(createError(502, error.message));
  }
};

const createOrder = async (req, res, next) => {
  const { pid, quantity } = req.body;
  const order = new Order({ pid, quantity });

  try {
    await order.save();
    res.status(201).json({ message: 'Created new order', order });
  } catch (error) {
    console.log(error);
    next(createError(502, error.message));
  }
};

const getOrder = async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return next(createError(422, 'No order with this ID'));
    }
    res.status(200).json({ message: `GET order with id ${orderId}`, order });
  } catch (error) {
    console.log(error);
    next(createError(502, error.message));
  }
};

const deleteOrder = async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return next(createError(422, 'No order with this ID'));
    }

    await order.remove();
    res.status(200).json({ message: `DELETE order with id ${orderId}` });
  } catch (error) {
    console.log(error);
    next(createError(502, error.message));
  }
};

module.exports = {
  getOrders,
  createOrder,
  getOrder,
  deleteOrder,
};
