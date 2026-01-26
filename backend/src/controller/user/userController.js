import pool from '../../database/index.js';
import { z } from 'zod';

// Define validation schemas inline (since we're using ES6 modules)
const petSchema = z.object({
  name: z.string().min(1, 'Pet name is required'),
  breed: z.string().optional(),
  type: z.enum(['adoption', 'missing'], {
    required_error: 'Type must be either adoption or missing'
  }),
  petType: z.string().optional(), // dog, cat, etc.
  age: z.number().int().positive().optional(),
  location: z.string().min(1, 'Location is required'),
  description: z.string().optional(),
  status: z.enum(['available', 'adopted', 'pending']).default('available'),
  image: z.string().url().optional().or(z.literal(''))
});

const updatePetSchema = z.object({
  name: z.string().min(1).optional(),
  breed: z.string().optional(),
  type: z.enum(['adoption', 'missing']).optional(),
  petType: z.string().optional(),
  age: z.number().int().positive().optional(),
  location: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['available', 'adopted', 'pending']).optional(),
  image: z.string().url().optional().or(z.literal(''))
});

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

    const missingPets = await pool.query(
      'SELECT COUNT(*) FROM pets WHERE user_id = $1 AND type = $2',
      [userId, 'missing']
    );

    const availablePets = await pool.query(
      'SELECT COUNT(*) FROM pets WHERE user_id = $1 AND status = $2',
      [userId, 'available']
    );

    res.status(200).json({
      success: true,
      data: {
        totalPosts: totalPosts.rows[0].count,
        adopted: adoptedPets.rows[0].count,
        missing: missingPets.rows[0].count,
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
