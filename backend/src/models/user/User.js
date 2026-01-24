import { pool } from "../../database/index.js";

export class User {
  constructor(id, username, email, password, createdAt) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const user = result.rows[0];
      return new User(
        user.id,
        user.username,
        user.email,
        user.password,
        user.created_at
      );
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const user = result.rows[0];
      return new User(
        user.id,
        user.username,
        user.email,
        user.password,
        user.created_at
      );
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  }

  /**
   * Find all users
   */
  static async findAll() {
    try {
      const result = await pool.query(
        "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC"
      );
      
      return result.rows.map(user => new User(
        user.id,
        user.username,
        user.email,
        null, // Don't include password
        user.created_at
      ));
    } catch (error) {
      console.error("Error finding all users:", error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  static async create(userData) {
    try {
      const result = await pool.query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
        [userData.username, userData.email, userData.password]
      );
      
      const user = result.rows[0];
      return new User(
        user.id,
        user.username,
        user.email,
        user.password,
        user.created_at
      );
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  /**
   * Update user
   */
  static async update(id, userData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (userData.username) {
        fields.push(`username = $${paramCount++}`);
        values.push(userData.username);
      }
      if (userData.email) {
        fields.push(`email = $${paramCount++}`);
        values.push(userData.email);
      }
      if (userData.password) {
        fields.push(`password = $${paramCount++}`);
        values.push(userData.password);
      }

      if (fields.length === 0) {
        return null;
      }

      values.push(id);
      const result = await pool.query(
        `UPDATE users SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      return new User(
        user.id,
        user.username,
        user.email,
        user.password,
        user.created_at
      );
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async delete(id) {
    try {
      const result = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING id",
        [id]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
}