import pool from './src/database/index.js';

async function migrate() {
    try {
        console.log('Adding reset_token and reset_token_expiry to users table...');

        // Add columns if they don't exist
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
            ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
        `);
        console.log('Migration successful!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrate();
