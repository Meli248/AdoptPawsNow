import pool from './src/database/index.js';

const checkStatusValues = async () => {
    try {
        const res = await pool.query('SELECT DISTINCT status FROM adoption_applications');
        console.log('Distinct status values in adoption_applications:');
        res.rows.forEach(r => console.log(`'${r.status}'`));

        const countRes = await pool.query('SELECT status, COUNT(*) FROM adoption_applications GROUP BY status');
        console.log('\nStatus counts:');
        countRes.rows.forEach(r => console.log(`${r.status}: ${r.count}`));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkStatusValues();
