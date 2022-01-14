const express = require('express');
const { check } = require('express-validator');

const {
  getOrders,
  createOrder,
  getOrder,
  deleteOrder,
} = require('../controllers/orders-controller');

const router = express.Router();

router.get('/', getOrders);

router.post(
  '/',
  [
    check('pid', 'Invalid product ID').isMongoId(),
    check('quantity', 'Please provide quantity value').isInt({ min: 1 }),
  ],
  createOrder
);

router.get('/:orderId', check('orderId').isMongoId(), getOrder);

router.delete('/:orderId', check('orderId').isMongoId(), deleteOrder);

module.exports = router;
