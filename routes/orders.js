const express = require('express');

const ordersController = require('../controllers/orders-controller');

const router = express.Router();

router.get('/', ordersController.getOrders);

router.post('/', ordersController.createOrder);

router.get('/:orderId', ordersController.getOrder);

router.delete('/:orderId', ordersController.deleteOrder);

module.exports = router;
