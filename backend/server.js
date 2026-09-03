require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./src/config/db');
const { auditMiddleware } = require('./src/middlewares/auditLogger');

const authRoutes = require('./src/routes/authRoutes');
const zohoRoutes = require('./src/routes/zohoRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(auditMiddleware);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'Custom Employee Portal Backend',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/zoho', zohoRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

async function startServer() {
  try {
    console.log('Initializing database schema and initial data...');
    await initDatabase();

    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🚀 Custom Employee Portal Backend running on port ${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`🛡️  RBAC & Zoho One API Integration active`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('Failed to start backend server:', error);
    process.exit(1);
  }
}

startServer();
