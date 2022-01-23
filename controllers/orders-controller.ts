import express from 'express';
import createError, { CreateHttpError } from 'http-errors';
import { validationResult } from 'express-validator';

const Order = require('../models/order');
const Product = require('../models/product');

const getOrders = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const orders = await Order.find();
    res.status(200).json({ message: 'GET all orders', orders });
  } catch (error) {
    console.log(error);
    const message = error instanceof Error ? error.message : 'Unknown';
    next(createError(502, message));
  }
};

const createOrder = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pid, quantity } = req.body;
  const order = new Order({ pid, quantity });

  try {
    const product = await Product.findById(pid);
    if (!product) {
      return next(createError(422, 'No product found'));
    }

    await order.save();
    res.status(201).json({ message: 'Created new order', order });
  } catch (error) {
    console.log(error);
    next(createError(502, error.message));
  }
};

const getOrder = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(400, 'Invalid order ID'));
  }

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

const deleteOrder = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(400, 'Invalid order ID'));
  }

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

export { getOrders, createOrder, getOrder, deleteOrder };
