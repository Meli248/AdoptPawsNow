import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './route/auth/authRoute.js';
import petsRoutes from './route/pets/petsRoute.js';
import missingRoutes from './route/missing/missingRoute.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// MIDDLEWARE
// ============================================

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AdoptPawsNow API is running!',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/missing', missingRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    availableRoutes: {
      auth: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/me'
      ],
      pets: [
        'GET /api/pets/pets',
        'GET /api/pets/pets/:id',
        'POST /api/pets/pets',
        'PUT /api/pets/pets/:id',
        'DELETE /api/pets/pets/:id',
        'POST /api/pets/applications',
        'GET /api/pets/applications'
      ],
      missing: [
        'GET /api/missing/missing-pets',
        'GET /api/missing/missing-pets/:id',
        'POST /api/missing/missing-pets',
        'PUT /api/missing/missing-pets/:id',
        'DELETE /api/missing/missing-pets/:id',
        'POST /api/missing/sightings',
        'GET /api/missing/sightings'
      ]
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log('='.repeat(50));
  console.log('Available routes:');
  console.log('  Auth:    /api/auth/*');
  console.log('  Pets:    /api/pets/*');
  console.log('  Missing: /api/missing/*');
  console.log('='.repeat(50));
});

export default app;