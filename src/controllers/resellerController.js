const productService = require('../services/productService');

// GET /api/v1/products - only unsold products, no internal pricing info
async function getProducts(req, res) {
  try {
    const products = await productService.getAvailableProducts();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error_code: 'INTERNAL_ERROR', message: 'Failed to fetch products' });
  }
}

// GET /api/v1/products/:productId
async function getProductById(req, res) {
  try {
    const product = await productService.getProductById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error_code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error_code: 'INTERNAL_ERROR', message: 'Failed to fetch product' });
  }
}

// POST /api/v1/products/:productId/purchase
async function purchaseProduct(req, res) {
  try {
    const { reseller_price } = req.body;

    if (reseller_price == null || typeof reseller_price !== 'number') {
      return res.status(400).json({
        error_code: 'VALIDATION_ERROR',
        message: 'reseller_price is required and must be a number',
      });
    }

    const result = await productService.purchaseProduct(req.params.productId, reseller_price);

    if (result.error) {
      return res.status(result.status).json({
        error_code: result.error,
        message: result.message || result.error,
      });
    }

    res.json(result.data);
  } catch (err) {
    console.error('Error purchasing product:', err);
    res.status(500).json({ error_code: 'INTERNAL_ERROR', message: 'Purchase failed' });
  }
}

module.exports = { getProducts, getProductById, purchaseProduct };
