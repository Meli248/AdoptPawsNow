import pool from './src/database/index.js';

const updateSchema = async () => {
    try {
        console.log('Adding location column to surrender_applications...');
        await pool.query("ALTER TABLE surrender_applications ADD COLUMN IF NOT EXISTS location VARCHAR(200);");
        console.log('Column added successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
};

updateSchema();
