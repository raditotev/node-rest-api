const express = require('express');
const { check } = require('express-validator');

const ordersController = require('../controllers/orders-controller');

const router = express.Router();

router.get('/', ordersController.getOrders);

router.post(
  '/',
  [
    check('pid', 'Invalid product ID').isMongoId(),
    check('quantity', 'Please provide quantity value').isInt({ min: 1 }),
  ],
  ordersController.createOrder
);

router.get(
  '/:orderId',
  check('orderId').isMongoId(),
  ordersController.getOrder
);

router.delete(
  '/:orderId',
  check('orderId').isMongoId(),
  ordersController.deleteOrder
);

module.exports = router;
