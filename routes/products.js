const express = require('express');

const productsController = require('../controllers/products-controller');

const router = express.Router();

router.get('/', productsController.getProducts);

router.post('/', productsController.createProduct);

router.get('/:productId', productsController.getProduct);

router.patch('/:productId', productsController.updateProduct);

router.delete('/:productId', productsController.deleteProduct);

module.exports = router;
