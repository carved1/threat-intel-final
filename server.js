const express = require('express');
const path = require('path');
const cors = require('cors');
const sequelize = require('./database/config');
require('dotenv').config();

const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const sha256Routes = require('./routes/sha256Routes');
const urlRoutes = require('./routes/urlRoutes');
const ipPortRoutes = require('./routes/ipPortRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger);

// API Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'ThreatFox IOC API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      sha256: '/api/sha256',
      urls: '/api/urls',
      ipports: '/api/ipports'
    },
    documentation: 'See README.md for full API documentation'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/sha256', sha256Routes);
app.use('/api/urls', urlRoutes);
app.use('/api/ipports', ipPortRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`API endpoints available at:`);
      console.log(`  - http://localhost:${PORT}/api/sha256`);
      console.log(`  - http://localhost:${PORT}/api/urls`);
      console.log(`  - http://localhost:${PORT}/api/ipports`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
