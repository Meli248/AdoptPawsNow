import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './database/index.js';

// Import routes
import authRoutes from './route/auth/authRoute.js';
import petsRoutes from './route/pets/petsRoute.js';
import userRoutes from './route/user/userRoute.js';
import postRoutes from './route/post/postRoute.js';
import statsRoutes from './route/stats/statsRoute.js';
import notificationRoutes from './route/notification/notificationRoute.js';

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
app.use('/api/users', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);

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

// Create tables if not exists
const createTables = async () => {
  try {
    // Favorites Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        favorite_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        pet_id INTEGER NOT NULL REFERENCES pets(pet_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, pet_id)
      );
    `);
    console.log('✅ Favorites table checked/created');

    // Notifications Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        image_url TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure image_url column exists for existing installations
    await pool.query(`
      ALTER TABLE notifications 
      ADD COLUMN IF NOT EXISTS image_url TEXT;
    `);
    console.log('✅ Notifications table checked/created/updated');

    // Add location column to pets if not exists
    await pool.query(`
      ALTER TABLE pets 
      ADD COLUMN IF NOT EXISTS location VARCHAR(255);
    `);
    console.log('✅ Pets table schema updated (location column)');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
};

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    await createTables();
    console.log('='.repeat(50));
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log('='.repeat(50));
    console.log('Available routes:');
    console.log('  Auth:    /api/auth/*');
    console.log('  Pets:    /api/pets/*');
    console.log('  Notifications: /api/notifications/*');
    console.log('='.repeat(50));
  });
}

export default app;