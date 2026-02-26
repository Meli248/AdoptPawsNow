import pool from './src/database/index.js';

const checkSchemas = async () => {
    try {
        const petsRes = await pool.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'pets'
    `);
        const appRes = await pool.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'adoption_applications'
    `);

        console.log('PETS_COLUMNS:', JSON.stringify(petsRes.rows.map(r => r.column_name)));
        console.log('APP_COLUMNS:', JSON.stringify(appRes.rows.map(r => r.column_name)));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkSchemas();
