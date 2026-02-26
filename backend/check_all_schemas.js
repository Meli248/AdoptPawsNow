import pool from './src/database/index.js';

const checkSchemas = async () => {
    try {
        const petsRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pets'
    `);
        console.log('Columns in pets:');
        petsRes.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));

        const appRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'adoption_applications'
    `);
        console.log('\nColumns in adoption_applications:');
        appRes.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkSchemas();
