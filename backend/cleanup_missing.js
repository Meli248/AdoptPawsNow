import pool from './src/database/index.js';

const cleanDatabase = async () => {
    try {
        console.log('Deleting missing pets...');
        const result = await pool.query("DELETE FROM pets WHERE type = 'missing' OR status = 'missing'");
        console.log(`Deleted ${result.rowCount} missing pet records.`);

        // Also remove any missing pet related tables if they exist separate from pets (checked schema, they don't seem to, but checking schema again)
        // Schema has 'pets' table with 'type' column.

        process.exit(0);
    } catch (error) {
        console.error('Error cleaning database:', error);
        process.exit(1);
    }
};

cleanDatabase();
