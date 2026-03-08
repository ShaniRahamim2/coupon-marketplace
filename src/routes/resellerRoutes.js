const express = require('express');
const router = express.Router();
const resellerController = require('../controllers/resellerController');
const { resellerAuth } = require('../middleware/auth');

// every reseller route needs a valid bearer token
router.use(resellerAuth);

router.get('/products', resellerController.getProducts);
router.get('/products/:productId', resellerController.getProductById);
router.post('/products/:productId/purchase', resellerController.purchaseProduct);

module.exports = router;
