import pool from './src/database/index.js';

async function testConnection() {
  try {
    // Test getting pets
    const result = await pool.query('SELECT * FROM pets LIMIT 3');
    console.log('\n✅ Successfully connected to database!');
    console.log(`Found ${result.rows.length} pets:`, result.rows.map(p => p.name));
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();