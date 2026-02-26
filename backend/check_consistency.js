import pool from './src/database/index.js';

const checkConsistency = async () => {
    try {
        const apps = await pool.query('SELECT pet_id FROM adoption_applications');
        console.log('Adoption Applications Pet IDs:', apps.rows.map(r => r.pet_id));

        const pets = await pool.query('SELECT pet_id FROM pets');
        console.log('Pets Table Pet IDs:', pets.rows.map(r => r.pet_id));

        const orphanApps = await pool.query(`
      SELECT a.application_id, a.pet_id 
      FROM adoption_applications a
      LEFT JOIN pets p ON a.pet_id = p.pet_id
      WHERE p.pet_id IS NULL
    `);

        console.log('Orphan applications (no matching pet):', orphanApps.rows.length);
        if (orphanApps.rows.length > 0) {
            console.log('Orphan Application IDs:', orphanApps.rows.map(r => r.application_id));
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkConsistency();
