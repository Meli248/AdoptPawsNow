import pool from './src/database/index.js';

const checkSchemas = async () => {
    try {
        const petsRes = await pool.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'pets'
    `);
        console.log('--- PETS COLUMNS ---');
        petsRes.rows.forEach(r => console.log(r.column_name));

        const appRes = await pool.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'adoption_applications'
    `);
        console.log('\n--- APP COLUMNS ---');
        appRes.rows.forEach(r => console.log(r.column_name));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkSchemas();
