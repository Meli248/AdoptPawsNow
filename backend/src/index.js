// server.js - Main Express server file with ES6 imports
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pg from 'pg';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// ES6 module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images - MUST BE BEFORE ROUTES
// This serves files from backend/uploads at the /uploads URL
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));
console.log('📁 Serving static files from:', uploadsPath);

// ============================================
// DATABASE CONNECTION
// ============================================
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'adoptpaws',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.stack);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

// ============================================
// FILE UPLOAD CONFIGURATION
// ============================================
// FIXED: Save to backend/uploads (same place where we serve from)
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory at:', uploadsDir);
} else {
  console.log('✅ Uploads directory exists at:', uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pet-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================
const handleError = (res, error, message = 'An error occurred') => {
  console.error(message + ':', error);
  res.status(500).json({ 
    success: false, 
    message: message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ADOPTION PETS ROUTES
// ============================================

// GET all pets for adoption
app.get('/api/pets', async (req, res) => {
  try {
    const { species, status, limit } = req.query;
    let query = 'SELECT * FROM pets WHERE 1=1';
    const params = [];

    if (species) {
      params.push(species);
      query += ` AND species = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    } else {
      query += ` AND status = 'Available'`;
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
      params.push(parseInt(limit));
      query += ` LIMIT $${params.length}`;
    }

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (error) {
    handleError(res, error, 'Error fetching pets');
  }
});

// GET single pet by ID
app.get('/api/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM pets WHERE pet_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    handleError(res, error, 'Error fetching pet');
  }
});


// POST create new pet for adoption
app.post('/api/pets', upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      species,
      breed,
      age,
      gender,
      size,
      color,
      description,
      vaccinated,
      neutered,
      status,
      // NEW: Contact fields
      contact_name,
      contact_email,
      contact_phone,
      contact_type
    } = req.body;

    // Validation
    if (!name || !species || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, species, and description are required' 
      });
    }

    // NEW: Validate contact information
    if (!contact_name || !contact_email || !contact_phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Contact name, email, and phone are required' 
      });
    }

    // Get image URL
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const query = `
      INSERT INTO pets (name, species, breed, age, gender, size, color, description, 
                       vaccinated, neutered, status, image_url, 
                       contact_name, contact_email, contact_phone, contact_type, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      RETURNING *
    `;

    const values = [
      name,
      species,
      breed || 'Mixed',
      age || 'Unknown',
      gender || 'Unknown',
      size || 'Medium',
      color || 'Various',
      description,
      vaccinated === 'true' || vaccinated === true,
      neutered === 'true' || neutered === true,
      status || 'Available',
      imageUrl,
      // NEW: Contact values
      contact_name,
      contact_email,
      contact_phone,
      contact_type || 'individual'
    ];

    const result = await pool.query(query, values);
    res.status(201).json({
      success: true,
      message: 'Pet posted for adoption successfully!',
      data: result.rows[0]
    });
  } catch (error) {
    handleError(res, error, 'Error creating pet listing');
  }
});

// PUT update pet
app.put('/api/pets/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      species,
      breed,
      age,
      gender,
      size,
      color,
      description,
      vaccinated,
      neutered,
      status
    } = req.body;

    // Check if pet exists
    const checkResult = await pool.query('SELECT * FROM pets WHERE pet_id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : checkResult.rows[0].image_url;

    const query = `
      UPDATE pets 
      SET name = $1, species = $2, breed = $3, age = $4, gender = $5, 
          size = $6, color = $7, description = $8, vaccinated = $9, 
          neutered = $10, status = $11, image_url = $12, updated_at = NOW()
      WHERE pet_id = $13
      RETURNING *
    `;

    const values = [
      name,
      species,
      breed,
      age,
      gender,
      size,
      color,
      description,
      vaccinated === 'true' || vaccinated === true,
      neutered === 'true' || neutered === true,
      status,
      imageUrl,
      id
    ];

    const result = await pool.query(query, values);
    res.json({
      success: true,
      message: 'Pet updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    handleError(res, error, 'Error updating pet');
  }
});

// DELETE pet
app.delete('/api/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get pet info to delete image file
    const pet = await pool.query('SELECT image_url FROM pets WHERE pet_id = $1', [id]);
    
    if (pet.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Delete from database
    await pool.query('DELETE FROM pets WHERE pet_id = $1', [id]);

    // Delete image file if exists
    if (pet.rows[0].image_url) {
      const imagePath = path.join(__dirname, pet.rows[0].image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ success: true, message: 'Pet deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Error deleting pet');
  }
});

// POST create adoption application
app.post('/api/applications', async (req, res) => {
  try {
    const {
      pet_id,
      applicant_name,
      email,
      phone,
      address,
      reason
    } = req.body;

    // Validation
    if (!pet_id || !applicant_name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Pet ID, name, and email are required' 
      });
    }

    const query = `
      INSERT INTO adoption_applications (pet_id, applicant_name, email, phone, address, reason, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'Pending', NOW())
      RETURNING *
    `;

    const values = [pet_id, applicant_name, email, phone, address, reason];
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! We will contact you soon.',
      data: result.rows[0]
    });
  } catch (error) {
    handleError(res, error, 'Error submitting application');
  }
});

// GET applications for a pet
app.get('/api/pets/:id/applications', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM adoption_applications WHERE pet_id = $1 ORDER BY created_at DESC',
      [id]
    );
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (error) {
    handleError(res, error, 'Error fetching applications');
  }
});

// ============================================
// MISSING PETS ROUTES
// ============================================

// GET all missing pets
app.get('/api/missing-pets', async (req, res) => {
  try {
    const { species, status, limit } = req.query;
    let query = 'SELECT * FROM missing_pets WHERE 1=1';
    const params = [];

    if (species) {
      params.push(species);
      query += ` AND species = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    } else {
      query += ` AND status = 'Missing'`;
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
      params.push(parseInt(limit));
      query += ` LIMIT $${params.length}`;
    }

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (error) {
    handleError(res, error, 'Error fetching missing pets');
  }
});

// GET single missing pet by ID
app.get('/api/missing-pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM missing_pets WHERE missing_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Missing pet not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    handleError(res, error, 'Error fetching missing pet');
  }
});

// POST create missing pet report
app.post('/api/missing-pets', upload.single('image'), async (req, res) => {
  try {
    const {
      pet_name,
      species,
      breed,
      age,
      gender,
      description,
      last_seen_location,
      last_seen_date,
      owner_name,
      owner_email,
      owner_phone,
      reward,
      status
    } = req.body;

    // Validation
    if (!pet_name || !species || !last_seen_location || !last_seen_date || !owner_name || !owner_email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Pet name, species, last seen location, last seen date, owner name, and owner email are required' 
      });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const query = `
      INSERT INTO missing_pets (pet_name, species, breed, age, gender, description,
                                last_seen_location, last_seen_date, owner_name, 
                                owner_email, owner_phone, reward, status, image_url, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      RETURNING *
    `;

    const values = [
      pet_name,
      species,
      breed || 'Unknown',
      age || 'Unknown',
      gender || 'Unknown',
      description,
      last_seen_location,
      last_seen_date,
      owner_name,
      owner_email,
      owner_phone || '',
      reward || '',
      status || 'Missing',
      imageUrl
    ];

    const result = await pool.query(query, values);
    res.status(201).json({
      success: true,
      message: 'Missing pet report submitted successfully!',
      data: result.rows[0]
    });
  } catch (error) {
    handleError(res, error, 'Error creating missing pet report');
  }
});

// POST report sighting
app.post('/api/sightings', async (req, res) => {
  try {
    const {
      missing_id,
      location,
      sighting_date,
      description,
      reporter_name,
      reporter_email,
      reporter_phone
    } = req.body;

    // Validation
    if (!missing_id || !location || !sighting_date || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing ID, location, sighting date, and description are required' 
      });
    }

    const query = `
      INSERT INTO sightings (missing_id, location, sighting_date, description,
                            reporter_name, reporter_email, reporter_phone, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;

    const values = [
      missing_id,
      location,
      sighting_date,
      description,
      reporter_name || 'Anonymous',
      reporter_email || '',
      reporter_phone || ''
    ];

    const result = await pool.query(query, values);
    res.status(201).json({
      success: true,
      message: 'Sighting reported successfully! The owner will be notified.',
      data: result.rows[0]
    });
  } catch (error) {
    handleError(res, error, 'Error reporting sighting');
  }
});

// GET sightings for a missing pet
app.get('/api/missing-pets/:id/sightings', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM sightings WHERE missing_id = $1 ORDER BY sighting_date DESC',
      [id]
    );
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (error) {
    handleError(res, error, 'Error fetching sightings');
  }
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler - MUST BE LAST
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});