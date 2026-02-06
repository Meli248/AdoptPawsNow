
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

async function promoteToAdmin(email) {
    try {
        console.log(`Promoting user ${email} to admin...`);

        // Check if user exists
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userCheck.rows.length === 0) {
            console.log('Error: User not found!');
            return;
        }

        const result = await pool.query(
            "UPDATE users SET role = 'admin' WHERE email = $1 RETURNING userid, full_name, email, role",
            [email]
        );

        console.log('Success! User updated:', result.rows[0]);
    } catch (err) {
        console.error('Error updating user:', err);
    } finally {
        await pool.end();
    }
}

// Get email from command line arg
const email = process.argv[2];

if (!email) {
    console.log('Please provide an email address.');
    console.log('Usage: node src/scripts/make_admin.js <email>');
} else {
    promoteToAdmin(email);
}
