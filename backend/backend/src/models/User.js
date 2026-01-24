import { query } from "../database/index.js";

export class User {
  static async create(username, email, hashedPassword) {
    try {
      const result = await query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
        [username, email, hashedPassword]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error("Username or email already exists");
      }
      throw error;
    }
  }

  static async findByEmail(email) {
    const result = await query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0];
  }

  static async findByUsername(username) {
    const result = await query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      "SELECT id, username, email, created_at FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }

  static async getAllUsers() {
    const result = await query(
      "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC"
    );
    return result.rows;
  }

  static async updateUser(id, username, email) {
    try {
      const result = await query(
        "UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email, created_at",
        [username, email, id]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error("Username or email already exists");
      }
      throw error;
    }
  }

  static async deleteUser(id) {
    const result = await query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows[0];
  }
}

export default User;
