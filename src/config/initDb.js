const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function initializeDatabase() {
  const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
  await pool.query(sql);
  console.log('Database tables initialized');
}

module.exports = initializeDatabase;
