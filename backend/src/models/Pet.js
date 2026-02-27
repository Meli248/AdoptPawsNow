import pool from '../database/index.js';

class Pet {
    static async findAll({ species, status = 'available', size, gender, limit, offset }) {
        let query = "SELECT * FROM pets";
        const params = [];
        const conditions = [];

        if (status !== 'all') {
            conditions.push(`LOWER(status) = LOWER($${params.length + 1})`);
            params.push(status);
        }

        if (species) {
            conditions.push(`species = $${params.length + 1}`);
            params.push(species);
        }

        if (size) {
            conditions.push(`size = $${params.length + 1}`);
            params.push(size);
        }

        if (gender) {
            conditions.push(`gender = $${params.length + 1}`);
            params.push(gender);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += ' ORDER BY created_at DESC';

        if (limit) {
            query += ` LIMIT $${params.length + 1}`;
            params.push(parseInt(limit));
        }

        if (offset) {
            query += ` OFFSET $${params.length + 1}`;
            params.push(parseInt(offset));
        }

        const result = await pool.query(query, params);
        return { rows: result.rows, count: result.rows.length };
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM pets WHERE pet_id = $1',
            [id]
        );
        return result.rows[0];
    }

    static async findByUserId(userId) {
        const result = await pool.query(
            `SELECT p.*, u.full_name as owner_name 
       FROM pets p 
       JOIN users u ON p.user_id = u.user_id 
       WHERE p.user_id = $1 
       ORDER BY p.created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    static async countByUserIdAndStatus(userId, status) {
        let query = 'SELECT COUNT(*) FROM pets WHERE user_id = $1';
        const params = [userId];

        if (status) {
            query += ' AND status = $2';
            params.push(status);
        }

        const result = await pool.query(query, params);
        return parseInt(result.rows[0].count, 10);
    }

    static async create(petData) {
        const {
            userId, name, species, breed, age, gender, size, color, description,
            image_url, vaccinated, neutered, status,
            contact_name, contact_email, contact_phone, contact_type, location, petType
        } = petData;

        // Support both schema variations (createPetPost vs createPet)
        const finalSpecies = species || petType || 'Unknown';

        const result = await pool.query(
            `INSERT INTO pets (
        user_id, name, species, breed, age, gender, size, color, description, 
        image_url, vaccinated, neutered, status,
        contact_name, contact_email, contact_phone, contact_type,
        location
      ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
       RETURNING *`,
            [
                userId, name, finalSpecies, breed || 'Mixed', age || null, gender || 'Unknown',
                size || 'Medium', color || 'Unknown', description, image_url,
                vaccinated === 'true' || vaccinated === true,
                neutered === 'true' || neutered === true,
                (status || 'available').toLowerCase(),
                contact_name || null, contact_email || null, contact_phone || null,
                contact_type || 'individual', location || 'Not specified'
            ]
        );
        return result.rows[0];
    }

    static async update(petId, updateData) {
        const {
            name, species, breed, age, gender, size, color, description,
            image_url, status, vaccinated, neutered,
            contact_name, contact_email, contact_phone, contact_type, location
        } = updateData;

        const result = await pool.query(
            `UPDATE pets 
       SET name = COALESCE($1, name),
           species = COALESCE($2, species),
           breed = COALESCE($3, breed),
           age = COALESCE($4, age),
           gender = COALESCE($5, gender),
           size = COALESCE($6, size),
           color = COALESCE($7, color),
           description = COALESCE($8, description),
           image_url = COALESCE($9, image_url),
           status = COALESCE($10, status),
           vaccinated = COALESCE($11, vaccinated),
           neutered = COALESCE($12, neutered),
           contact_name = COALESCE($13, contact_name),
           contact_email = COALESCE($14, contact_email),
           contact_phone = COALESCE($15, contact_phone),
           contact_type = COALESCE($16, contact_type),
           location = COALESCE($17, location),
           updated_at = CURRENT_TIMESTAMP
       WHERE pet_id = $18
       RETURNING *`,
            [
                name, species, breed, age, gender, size, color, description,
                image_url, status,
                vaccinated !== undefined ? (vaccinated === 'true' || vaccinated === true) : null,
                neutered !== undefined ? (neutered === 'true' || neutered === true) : null,
                contact_name, contact_email, contact_phone, contact_type, location,
                petId
            ]
        );
        return result.rows[0];
    }

    static async updateStatus(petId, status) {
        const result = await pool.query(
            `UPDATE pets SET status = $1 WHERE pet_id = $2 RETURNING *`,
            [status, petId]
        );
        return result.rows[0];
    }

    static async delete(petId, userId = null) {
        let query = 'DELETE FROM pets WHERE pet_id = $1';
        const params = [petId];

        if (userId) {
            query += ' AND user_id = $2';
            params.push(userId);
        }

        query += ' RETURNING *';

        const result = await pool.query(query, params);
        return result.rows[0];
    }
}

export default Pet;
