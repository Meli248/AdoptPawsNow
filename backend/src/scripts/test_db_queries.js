
import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function testQueries() {
    try {
        console.log('--- Testing getAllPets Query ---');
        const status = 'available';
        let query = "SELECT * FROM pets WHERE LOWER(status) = LOWER($1) AND type = 'adoption'";
        const params = [status];
        console.log('Query:', query);
        console.log('Params:', params);

        const petsRes = await pool.query(query, params);
        console.log('✅ Pets Query Success. Count:', petsRes.rowCount);

    } catch (err) {
        console.error('❌ Pets Query Failed:', err);
    }

    try {
        console.log('\n--- Testing getAllUsers Query ---');
        const userQuery = `SELECT user_id, username, email, full_name, role, status, created_at, 
      (SELECT COUNT(*) FROM pets WHERE pets.user_id = users.user_id) as posts_count 
      FROM users ORDER BY created_at DESC`;
        console.log('Query:', userQuery);

        const userRes = await pool.query(userQuery);
        console.log('✅ Users Query Success. Count:', userRes.rowCount);

    } catch (err) {
        console.error('❌ Users Query Failed:', err);
    }

    await pool.end();
}

testQueries();
