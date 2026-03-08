require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const initializeDatabase = require('./config/initDb');
const adminRoutes = require('./routes/adminRoutes');
const resellerRoutes = require('./routes/resellerRoutes');
const customerRoutes = require('./routes/customerRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// serve the frontend
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

// mount the API routes
app.use('/api/admin', adminRoutes);
app.use('/api/v1', resellerRoutes); // reseller endpoints as defined 
app.use('/api/customer', customerRoutes);

// basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// any non API route serves the frontend (for single page app)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

app.use(errorHandler);

async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
