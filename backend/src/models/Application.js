import pool from '../database/index.js';

class Application {
    static async create(applicationData) {
        const { pet_id, applicant_name, email, phone, address, reason } = applicationData;

        const result = await pool.query(
            `INSERT INTO adoption_applications
      (pet_id, applicant_name, email, phone, address, reason)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING *`,
            [pet_id, applicant_name, email, phone, address, reason]
        );

        return result.rows[0];
    }

    static async findAll({ status }) {
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

        const result = await pool.query(query, params);
        return { rows: result.rows, count: result.rows.length };
    }

    static async findById(id) {
        const result = await pool.query(
            `SELECT a.*, p.name as pet_name, p.species, p.breed 
       FROM adoption_applications a
       JOIN pets p ON a.pet_id = p.pet_id
       WHERE a.application_id = $1`,
            [id]
        );

        return result.rows[0];
    }

    static async updateStatus(id, status) {
        const result = await pool.query(
            `UPDATE adoption_applications 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE application_id = $2
       RETURNING *`,
            [status, id]
        );

        return result.rows[0];
    }
}

export default Application;
