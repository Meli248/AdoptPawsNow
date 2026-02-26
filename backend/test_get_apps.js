import pool from './src/database/index.js';

const testGetAllApps = async () => {
    try {
        const status = 'pending';
        let query = `
      SELECT a.*, p.name as pet_name, p.species, p.breed, p.image_url as pet_image 
      FROM adoption_applications a
      JOIN pets p ON a.pet_id = p.pet_id
    `;
        const params = [];
        if (status) {
            query += ' WHERE LOWER(a.status) = LOWER($1)';
            params.push(status);
        }
        query += ' ORDER BY a.created_at DESC';

        console.log('Query:', query);
        console.log('Params:', params);

        const res = await pool.query(query, params);
        console.log('Result count:', res.rows.length);
        if (res.rows.length > 0) {
            console.log('First row status:', res.rows[0].status);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

testGetAllApps();
