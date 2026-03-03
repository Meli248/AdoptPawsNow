import pool from '../database/index.js';

class User {
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT user_id, username, email, password_hash, full_name, role FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT user_id, full_name, username, email, role, phone, location, created_at, status FROM users WHERE user_id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findAllWithStats() {
    const result = await pool.query(
      `SELECT user_id, username, email, full_name, role, status, created_at, 
      (SELECT COUNT(*) FROM pets WHERE pets.user_id = users.user_id) as posts_count 
      FROM users ORDER BY created_at DESC`
    );
    return result.rows;
  }

  static async updateStatus(userId, status) {
    const result = await pool.query(
      'UPDATE users SET status = $1 WHERE user_id = $2 RETURNING *',
      [status, userId]
    );
    return result.rows[0];
  }

  static async create({ username, email, hashedPassword, fullName, role = 'user' }) {
    const insertQuery = `
      INSERT INTO users (username, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, username, email, full_name, role, created_at
    `;
    const values = [username, email, hashedPassword, fullName, role];
    const result = await pool.query(insertQuery, values);
    return result.rows[0];
  }

  static async updateRole(userId, role) {
    const result = await pool.query(
      "UPDATE users SET role = $2 WHERE user_id = $1 RETURNING *",
      [userId, role]
    );
    return result.rows[0];
  }

  static async updateLastLogin(userId) {
    const result = await pool.query(
      'UPDATE users SET updated_at = NOW() WHERE user_id = $1 RETURNING updated_at',
      [userId]
    );
    return result.rows[0];
  }

  static async updateProfile(userId, updateData) {
    const { name, username, phone, location } = updateData;

    // We only update what is provided
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Both full_name and username map to the 'name'/'username' from frontend
    if (name || username) {
      const newName = name || username;
      updates.push(`full_name = $${paramCount}`);
      values.push(newName);
      paramCount++;

      updates.push(`username = $${paramCount}`);
      values.push(newName);
      paramCount++;
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramCount}`);
      values.push(phone || null);
      paramCount++;
    }

    if (location !== undefined) {
      updates.push(`location = $${paramCount}`);
      values.push(location || null);
      paramCount++;
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) { // Only updated_at is there, no real changes
      return await this.findById(userId);
    }

    values.push(userId);
    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE user_id = $${paramCount} 
      RETURNING user_id, full_name, username, email, role, phone, location, created_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

export default User;
