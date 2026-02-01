// ============================================
// ADOPTPAWS - COMPLETE SETUP SCRIPT
// Run this ONCE after cloning from GitHub
// ============================================

import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'adoptpawsnow',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

const setupSQL = `
-- Drop existing tables if they exist
DROP TABLE IF EXISTS sightings CASCADE;
DROP TABLE IF EXISTS adoption_applications CASCADE;
DROP TABLE IF EXISTS missing_pets CASCADE;
DROP TABLE IF EXISTS pets CASCADE;

-- ============================================
-- PETS TABLE (for adoption)
-- ============================================
CREATE TABLE pets (
    pet_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100) DEFAULT 'Mixed',
    age VARCHAR(50) DEFAULT 'Unknown',
    gender VARCHAR(20) DEFAULT 'Unknown',
    size VARCHAR(20) DEFAULT 'Medium',
    color VARCHAR(50) DEFAULT 'Various',
    description TEXT,
    vaccinated BOOLEAN DEFAULT FALSE,
    neutered BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'Available',
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ADOPTION APPLICATIONS TABLE
-- ============================================
CREATE TABLE adoption_applications (
    application_id SERIAL PRIMARY KEY,
    pet_id INTEGER NOT NULL,
    applicant_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pet FOREIGN KEY (pet_id) REFERENCES pets(pet_id) ON DELETE CASCADE
);

-- ============================================
-- MISSING PETS TABLE
-- ============================================
CREATE TABLE missing_pets (
    missing_id SERIAL PRIMARY KEY,
    pet_name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100) DEFAULT 'Unknown',
    age VARCHAR(50),
    gender VARCHAR(20) DEFAULT 'Unknown',
    color VARCHAR(50),
    description TEXT,
    last_seen_location VARCHAR(200) NOT NULL,
    last_seen_date DATE NOT NULL,
    image_url VARCHAR(500),
    owner_name VARCHAR(100) NOT NULL,
    owner_email VARCHAR(100) NOT NULL,
    owner_phone VARCHAR(20),
    reward DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'Missing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SIGHTINGS TABLE
-- ============================================
CREATE TABLE sightings (
    sighting_id SERIAL PRIMARY KEY,
    missing_id INTEGER NOT NULL,
    location VARCHAR(200) NOT NULL,
    sighting_date DATE NOT NULL,
    description TEXT,
    reporter_name VARCHAR(100),
    reporter_email VARCHAR(100),
    reporter_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_missing_pet FOREIGN KEY (missing_id) REFERENCES missing_pets(missing_id) ON DELETE CASCADE
);

-- ============================================
-- SAMPLE DATA
-- ============================================
INSERT INTO pets (name, species, breed, age, gender, size, color, description, vaccinated, neutered, status, image_url) VALUES
('Max', 'Dog', 'Golden Retriever', '2 years', 'Male', 'Large', 'Golden', 'Friendly and energetic dog looking for a loving home.', true, true, 'Available', '/uploads/sample-dog1.jpg'),
('Luna', 'Cat', 'Persian', '1 year', 'Female', 'Small', 'White', 'Gentle and affectionate cat who loves to cuddle.', true, true, 'Available', '/uploads/sample-cat1.jpg'),
('Buddy', 'Dog', 'Labrador', '3 years', 'Male', 'Large', 'Black', 'Loyal companion, great with kids.', true, true, 'Available', '/uploads/sample-dog2.jpg');

INSERT INTO missing_pets (pet_name, species, breed, age, gender, color, description, last_seen_location, last_seen_date, owner_name, owner_email, owner_phone, reward, status, image_url) VALUES
('Charlie', 'Dog', 'Beagle', '4 years', 'Male', 'Brown and White', 'Missing since last week. Wearing a red collar.', 'Central Park', '2026-01-25', 'John Doe', 'john@example.com', '123-456-7890', 100.00, 'Missing', '/uploads/sample-missing1.jpg');
`;

async function completeSetup() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   ADOPTPAWS - COMPLETE SETUP SCRIPT           ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  try {
    // ============================================
    // 1. CHECK ENVIRONMENT
    // ============================================
    console.log('📋 Step 1: Checking environment...');
    
    if (!fs.existsSync('.env')) {
      console.error('❌ .env file not found!');
      console.log('\n💡 Create a .env file with:');
      console.log('DB_USER=postgres');
      console.log('DB_HOST=localhost');
      console.log('DB_DATABASE=adoptpawsnow');
      console.log('DB_PASSWORD=your_password');
      console.log('DB_PORT=5432');
      process.exit(1);
    }
    
    console.log('✅ .env file found');
    console.log(`   Database: ${process.env.DB_DATABASE}`);
    console.log(`   User: ${process.env.DB_USER}`);
    console.log(`   Host: ${process.env.DB_HOST}`);

    // ============================================
    // 2. CREATE UPLOADS FOLDER
    // ============================================
    console.log('\n📁 Step 2: Creating uploads folder...');
    
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Created uploads folder at:', uploadsDir);
    } else {
      console.log('✅ Uploads folder already exists');
    }

    // ============================================
    // 3. TEST DATABASE CONNECTION
    // ============================================
    console.log('\n🔌 Step 3: Testing database connection...');
    
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL!');
    
    const dbResult = await client.query('SELECT current_database(), version()');
    console.log(`   Database: ${dbResult.rows[0].current_database}`);
    console.log(`   Version: ${dbResult.rows[0].version.split(',')[0]}`);

    // ============================================
    // 4. CREATE TABLES
    // ============================================
    console.log('\n🔨 Step 4: Creating database tables...');
    console.log('   (This will drop existing tables if they exist)');
    
    await client.query(setupSQL);
    console.log('✅ All tables created successfully!');

    // ============================================
    // 5. VERIFY TABLES
    // ============================================
    console.log('\n🔍 Step 5: Verifying tables...');
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('   Tables created:');
    tablesResult.rows.forEach(row => {
      console.log('      ✓', row.table_name);
    });

    // ============================================
    // 6. VERIFY SAMPLE DATA
    // ============================================
    console.log('\n📊 Step 6: Verifying sample data...');
    
    const petsCount = await client.query('SELECT COUNT(*) FROM pets');
    const missingCount = await client.query('SELECT COUNT(*) FROM missing_pets');
    
    console.log(`   Pets: ${petsCount.rows[0].count} records`);
    console.log(`   Missing pets: ${missingCount.rows[0].count} records`);

    // ============================================
    // 7. CLEANUP
    // ============================================
    client.release();
    await pool.end();

    // ============================================
    // SUCCESS!
    // ============================================
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║   ✅ SETUP COMPLETED SUCCESSFULLY!            ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    
    console.log('🚀 Next steps:');
    console.log('   1. Start backend:  npm run dev');
    console.log('   2. Start frontend: cd ../frontend && npm run dev');
    console.log('   3. Open browser:   http://localhost:5173\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\n💡 Common issues:');
    console.error('   - PostgreSQL is not running');
    console.error('   - Wrong database credentials in .env');
    console.error('   - Database does not exist (create it in pgAdmin first)');
    console.error('   - Wrong password\n');
    process.exit(1);
  }
}

completeSetup();