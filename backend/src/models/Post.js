import pool from '../database/index.js';

class Post {
    static async create(postData) {
        const {
            userId, pet_name, pet_type, breed, age, gender, reason,
            image_url, contact_name, contact_email, contact_phone, location
        } = postData;

        const result = await pool.query(
            `INSERT INTO post_applications 
      (user_id, pet_name, pet_type, breed, age, gender, reason, image_url, contact_name, contact_email, contact_phone, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
            [userId, pet_name, pet_type, breed, age, gender, reason, image_url, contact_name, contact_email, contact_phone, location]
        );
        return result.rows[0];
    }

    static async findAll({ status }) {
        let query = `
      SELECT s.*, u.full_name as user_name, u.email as user_email
      FROM post_applications s
      JOIN users u ON s.user_id = u.user_id
    `;
        const params = [];

        if (status) {
            query += ' WHERE s.status = $1';
            params.push(status);
        }
        query += ' ORDER BY s.created_at DESC';

        const result = await pool.query(query, params);
        return result.rows;
    }

    static async findByIdAndUser(applicationId, userId) {
        const result = await pool.query(
            'SELECT * FROM post_applications WHERE application_id = $1 AND user_id = $2',
            [applicationId, userId]
        );
        return result.rows[0];
    }

    static async findByUserId(userId) {
        const result = await pool.query(
            `SELECT * FROM post_applications 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    static async updateStatus(applicationId, status) {
        const result = await pool.query(
            'UPDATE post_applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE application_id = $2 RETURNING *',
            [status, applicationId]
        );
        return result.rows[0];
    }

    static async update(applicationId, userId, updateData) {
        const {
            pet_name, pet_type, breed, age, gender, reason,
            contact_name, contact_email, contact_phone, location, image_url
        } = updateData;

        let query = `
      UPDATE post_applications 
      SET pet_name = COALESCE($1, pet_name),
          pet_type = COALESCE($2, pet_type),
          breed = COALESCE($3, breed),
          age = COALESCE($4, age),
          gender = COALESCE($5, gender),
          reason = COALESCE($6, reason),
          contact_name = COALESCE($7, contact_name),
          contact_email = COALESCE($8, contact_email),
          contact_phone = COALESCE($9, contact_phone),
          location = COALESCE($10, location),
          updated_at = CURRENT_TIMESTAMP
    `;

        const params = [pet_name, pet_type, breed, age, gender, reason, contact_name, contact_email, contact_phone, location];

        if (image_url) {
            query += `, image_url = $${params.length + 1}`;
            params.push(image_url);
        }

        query += ` WHERE application_id = $${params.length + 1} AND user_id = $${params.length + 2} RETURNING *`;
        params.push(applicationId, userId);

        const result = await pool.query(query, params);
        return result.rows[0];
    }

    static async delete(applicationId, userId) {
        const result = await pool.query(
            'DELETE FROM post_applications WHERE application_id = $1 AND user_id = $2 RETURNING *',
            [applicationId, userId]
        );
        return result.rows[0];
    }
}

export default Post;
