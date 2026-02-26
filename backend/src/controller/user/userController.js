import pool from '../../database/index.js';
import { petSchema, updatePetSchema } from '../../validation/schemas.js';

// Get User Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const totalPosts = await pool.query(
      'SELECT COUNT(*) FROM pets WHERE user_id = $1',
      [userId]
    );

    const adoptedPets = await pool.query(
      'SELECT COUNT(*) FROM pets WHERE user_id = $1 AND status = $2',
      [userId, 'adopted']
    );

    // Missing pets functionality removed
    const missingPets = { rows: [{ count: 0 }] };

    const availablePets = await pool.query(
      'SELECT COUNT(*) FROM pets WHERE user_id = $1 AND status = $2',
      [userId, 'available']
    );

    res.status(200).json({
      success: true,
      data: {
        totalPosts: totalPosts.rows[0].count,
        adopted: adoptedPets.rows[0].count,
        missing: 0,
        available: availablePets.rows[0].count
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get User Posts
export const getUserPosts = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT p.*, u.full_name as owner_name 
       FROM pets p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.user_id = $1 
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create Pet Post
export const createPetPost = async (req, res) => {
  try {
    const validatedData = petSchema.parse(req.body);
    const userId = req.user.userId;

    const {
      name,
      breed,
      type,
      age,
      location,
      description,
      status,
      image,
      petType
    } = validatedData;

    const result = await pool.query(
      `INSERT INTO pets (user_id, name, breed, type, age, location, description, status, image, pet_type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [userId, name, breed, type, age, location, description, status, image, petType]
    );

    res.status(201).json({
      success: true,
      message: 'Pet post created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    console.error('Create pet post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update Pet Post
export const updatePetPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const validatedData = updatePetSchema.parse(req.body);

    // Check if pet belongs to user
    const petCheck = await pool.query(
      'SELECT * FROM pets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (petCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found or unauthorized'
      });
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(validatedData).forEach(key => {
      if (validatedData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(validatedData[key]);
        paramCount++;
      }
    });

    values.push(id);
    values.push(userId);

    const result = await pool.query(
      `UPDATE pets SET ${fields.join(', ')}, updated_at = NOW() 
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1} 
       RETURNING *`,
      values
    );

    res.status(200).json({
      success: true,
      message: 'Pet post updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    console.error('Update pet post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete Pet Post
export const deletePetPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      'DELETE FROM pets WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pet post deleted successfully'
    });
  } catch (error) {
    console.error('Delete pet post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==========================================
// ADMIN USER MANAGEMENT
// ==========================================

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, username, email, full_name, role, status, created_at, 
      (SELECT COUNT(*) FROM pets WHERE pets.user_id = users.user_id) as posts_count 
      FROM users ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Block user
export const blockUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent blocking self
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot block yourself'
      });
    }

    const result = await pool.query(
      'UPDATE users SET status = $1 WHERE user_id = $2 RETURNING *',
      ['blocked', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User blocked successfully'
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Unblock user
export const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE users SET status = $1 WHERE user_id = $2 RETURNING *',
      ['active', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
