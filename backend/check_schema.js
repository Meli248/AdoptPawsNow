import pool from './src/database/index.js';
import fs from 'fs';

async function checkSchema() {
    try {
        let output = '';
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'notifications';
        `);
        output += 'Columns in notifications table:\n';
        output += JSON.stringify(res.rows, null, 2) + '\n\n';

        const appsRes = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'adoption_applications';
        `);
        output += 'Columns in adoption_applications table:\n';
        output += JSON.stringify(appsRes.rows, null, 2) + '\n';

        fs.writeFileSync('schema_output.txt', output);
        console.log('✅ Schema saved to schema_output.txt');
        process.exit(0);
    } catch (err) {
        console.error('Error checking schema:', err);
        process.exit(1);
    }
}

checkSchema();
