const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'coupon_marketplace',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

pool.query('SELECT NOW()')
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('DB connection failed:', err.message));

module.exports = pool;
