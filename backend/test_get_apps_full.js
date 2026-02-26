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

        const res = await pool.query(query, params);
        console.log('Result count:', res.rows.length);
        res.rows.forEach((row, i) => {
            console.log(`Row ${i}:`, JSON.stringify(row));
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

testGetAllApps();
