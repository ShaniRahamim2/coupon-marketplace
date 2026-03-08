const productService = require('../services/productService');

// GET /api/customer/products - shows available coupons to buy
async function getProducts(req, res) {
  try {
    const products = await productService.getAvailableProducts();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error_code: 'INTERNAL_ERROR', message: 'Failed to fetch products' });
  }
}

// POST /api/customer/products/:id/purchase
// no price needed - customers always pay the minimum_sell_price
async function purchaseProduct(req, res) {
  try {
    const result = await productService.purchaseProduct(req.params.id, null);

    if (result.error) {
      return res.status(result.status).json({
        error_code: result.error,
        message: result.message || result.error,
      });
    }

    res.json(result.data);
  } catch (err) {
    console.error('Error purchasing:', err);
    res.status(500).json({ error_code: 'INTERNAL_ERROR', message: 'Purchase failed' });
  }
}

module.exports = { getProducts, purchaseProduct };
