const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/products', customerController.getProducts);
router.post('/products/:id/purchase', customerController.purchaseProduct);

module.exports = router;
