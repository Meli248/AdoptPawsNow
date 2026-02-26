import pool from './src/database/index.js';

const checkData = async () => {
    try {
        const res = await pool.query('SELECT * FROM adoption_applications');
        console.log('Total applications:', res.rows.length);
        if (res.rows.length > 0) {
            console.log('Last application:', JSON.stringify(res.rows[res.rows.length - 1]));
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkData();
