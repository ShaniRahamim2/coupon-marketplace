const pool = require('../config/db');

async function findAvailable() {
  const result = await pool.query(
    'SELECT * FROM products WHERE is_sold = false ORDER BY created_at DESC'
  );
  return result.rows;
}

// admin needs to see everything, including sold products
async function findAll() {
  const result = await pool.query(
    'SELECT * FROM products ORDER BY created_at DESC'
  );
  return result.rows;
}

async function findById(id) {
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function create(product) {
  const { name, description, type, image_url, cost_price, margin_percentage, minimum_sell_price, value_type, value } = product;

  const result = await pool.query(
    `INSERT INTO products (name, description, type, image_url, cost_price, margin_percentage, minimum_sell_price, value_type, value)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [name, description, type || 'COUPON', image_url, cost_price, margin_percentage, minimum_sell_price, value_type || 'STRING', value]
  );
  return result.rows[0];
}

async function update(id, fields) {
  const { name, description, image_url, cost_price, margin_percentage, minimum_sell_price, value_type, value } = fields;

  // COALESCE keeps the old value if the new one is null
  const result = await pool.query(
    `UPDATE products
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         image_url = COALESCE($3, image_url),
         cost_price = COALESCE($4, cost_price),
         margin_percentage = COALESCE($5, margin_percentage),
         minimum_sell_price = COALESCE($6, minimum_sell_price),
         value_type = COALESCE($7, value_type),
         value = COALESCE($8, value),
         updated_at = NOW()
     WHERE id = $9
     RETURNING *`,
    [name, description, image_url, cost_price, margin_percentage, minimum_sell_price, value_type, value, id]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
}

// this is the important one - uses a transaction with row locking
// so two people can't buy the same coupon at the same time
async function markAsSold(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // FOR UPDATE locks this specific row until we commit/rollback
    const result = await client.query(
      'SELECT * FROM products WHERE id = $1 FOR UPDATE',
      [id]
    );

    const product = result.rows[0];
    if (!product) {
      await client.query('ROLLBACK');
      return { error: 'PRODUCT_NOT_FOUND' };
    }

    if (product.is_sold) {
      await client.query('ROLLBACK');
      return { error: 'PRODUCT_ALREADY_SOLD' };
    }

    await client.query(
      'UPDATE products SET is_sold = true, updated_at = NOW() WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');
    return { success: true, product };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  findAvailable,
  findAll,
  findById,
  create,
  update,
  remove,
  markAsSold,
};
