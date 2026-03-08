const productRepo = require('../repositories/productRepository');

// pricing formula = cost_price × (1 + margin_percentage / 100)
function calculateMinSellPrice(costPrice, marginPercentage) {
  return costPrice * (1 + marginPercentage / 100);
}

// public facing format - hides cost_price and margin from resellers/customers
function formatForPublic(product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    image_url: product.image_url,
    price: parseFloat(product.minimum_sell_price),
  };
}

// admin gets to see everything
function formatForAdmin(product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    type: product.type,
    image_url: product.image_url,
    cost_price: parseFloat(product.cost_price),
    margin_percentage: parseFloat(product.margin_percentage),
    minimum_sell_price: parseFloat(product.minimum_sell_price),
    is_sold: product.is_sold,
    value_type: product.value_type,
    value: product.value,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
}

async function getAvailableProducts() {
  const products = await productRepo.findAvailable();
  return products.map(formatForPublic);
}

async function getAllProducts() {
  const products = await productRepo.findAll();
  return products.map(formatForAdmin);
}

async function getProductById(id, isAdmin = false) {
  const product = await productRepo.findById(id);
  if (!product) return null;
  return isAdmin ? formatForAdmin(product) : formatForPublic(product);
}

async function createProduct(data) {
  const { name, description, image_url, cost_price, margin_percentage, value_type, value } = data;

  if (!name || !image_url || cost_price == null || margin_percentage == null || !value) {
    return { error: 'VALIDATION_ERROR', message: 'Missing required fields: name, image_url, cost_price, margin_percentage, value' };
  }

  if (cost_price < 0 || margin_percentage < 0) {
    return { error: 'VALIDATION_ERROR', message: 'cost_price and margin_percentage must be >= 0' };
  }

  const minimum_sell_price = calculateMinSellPrice(cost_price, margin_percentage);

  const product = await productRepo.create({
    name,
    description: description || '',
    type: 'COUPON',
    image_url,
    cost_price,
    margin_percentage,
    minimum_sell_price,
    value_type: value_type || 'STRING',
    value,
  });

  return { success: true, product: formatForAdmin(product) };
}

async function updateProduct(id, data) {
  const existing = await productRepo.findById(id);
  if (!existing) return { error: 'PRODUCT_NOT_FOUND' };

  // recalculate min price if cost or margin changed
  const costPrice = data.cost_price != null ? data.cost_price : parseFloat(existing.cost_price);
  const marginPct = data.margin_percentage != null ? data.margin_percentage : parseFloat(existing.margin_percentage);

  if (costPrice < 0 || marginPct < 0) {
    return { error: 'VALIDATION_ERROR', message: 'cost_price and margin_percentage must be >= 0' };
  }

  const minimum_sell_price = calculateMinSellPrice(costPrice, marginPct);

  const updated = await productRepo.update(id, {
    ...data,
    cost_price: costPrice,
    margin_percentage: marginPct,
    minimum_sell_price,
  });

  if (!updated) return { error: 'PRODUCT_NOT_FOUND' };
  return { success: true, product: formatForAdmin(updated) };
}

async function deleteProduct(id) {
  const deleted = await productRepo.remove(id);
  if (!deleted) return { error: 'PRODUCT_NOT_FOUND' };
  return { success: true };
}

// handles purchase for both customers and resellers
// customers pass null for resellerPrice (they pay minimum_sell_price)
// resellers pass their price which must be >= minimum_sell_price
async function purchaseProduct(id, resellerPrice = null) {
  const product = await productRepo.findById(id);
  if (!product) {
    return { error: 'PRODUCT_NOT_FOUND', status: 404 };
  }

  if (product.is_sold) {
    return { error: 'PRODUCT_ALREADY_SOLD', status: 409 };
  }

  const minPrice = parseFloat(product.minimum_sell_price);
  const finalPrice = resellerPrice != null ? resellerPrice : minPrice;

  if (resellerPrice != null && resellerPrice < minPrice) {
    return {
      error: 'RESELLER_PRICE_TOO_LOW',
      status: 400,
      message: `Price must be at least ${minPrice}`,
    };
  }

  const result = await productRepo.markAsSold(id);

  if (result.error === 'PRODUCT_NOT_FOUND') {
    return { error: 'PRODUCT_NOT_FOUND', status: 404 };
  }
  if (result.error === 'PRODUCT_ALREADY_SOLD') {
    return { error: 'PRODUCT_ALREADY_SOLD', status: 409 };
  }

  return {
    success: true,
    data: {
      product_id: product.id,
      final_price: finalPrice,
      value_type: product.value_type,
      value: product.value,
    },
  };
}

module.exports = {
  getAvailableProducts,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  purchaseProduct,
};
