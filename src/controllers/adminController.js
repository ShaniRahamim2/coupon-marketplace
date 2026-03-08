const productService = require('../services/productService');

async function getAllProducts(req, res) {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (err) {
    console.error('Error getting products:', err);
    res.status(500).json({ error_code: 'INTERNAL_ERROR', message: 'Failed to fetch products' });
  }
}

async function getProduct(req, res) {
  try {
    const product = await productService.getProductById(req.params.id, true);
    if (!product) {
      return res.status(404).json({ error_code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error getting product:', err);
    res.status(500).json({ error_code: 'INTERNAL_ERROR', message: 'Failed to fetch product' });
  }
}

async function createProduct(req, res) {
  try {
    const result = await productService.createProduct(req.body);

    if (result.error) {
      return res.status(400).json({ error_code: result.error, message: result.message });
    }

    res.status(201).json(result.product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error_code: 'INTERNAL_ERROR', message: 'Failed to create product' });
  }
}

async function updateProduct(req, res) {
  try {
    const result = await productService.updateProduct(req.params.id, req.body);

    if (result.error === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ error_code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
    }
    if (result.error) {
      return res.status(400).json({ error_code: result.error, message: result.message });
    }

    res.json(result.product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error_code: 'INTERNAL_ERROR', message: 'Failed to update product' });
  }
}

async function deleteProduct(req, res) {
  try {
    const result = await productService.deleteProduct(req.params.id);

    if (result.error === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ error_code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error_code: 'INTERNAL_ERROR', message: 'Failed to delete product' });
  }
}

module.exports = { getAllProducts, getProduct, createProduct, updateProduct, deleteProduct };
