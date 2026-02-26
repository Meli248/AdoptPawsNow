import pool from '../../database/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema, updateProfileSchema } from '../../validation/schemas.js';

/* ======================================
   REGISTER USER
====================================== */
export const register = async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: parsed.error.errors
      });
    }
    const { fullName, email, password } = parsed.data;

    console.log('📝 Registration attempt:', { fullName, email });

    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const username = email.split('@')[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO users (username, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, username, email, full_name, role, created_at
    `;

    const values = [username, email, hashedPassword, fullName, 'user'];
    const result = await pool.query(insertQuery, values);
    const user = result.rows[0];

    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        access_token: token,
        user: {
          id: user.user_id,
          full_name: user.full_name,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/* ======================================
   LOGIN USER
====================================== */
export const login = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: parsed.error.errors
      });
    }
    const { email, password } = parsed.data;

    const result = await pool.query(
      'SELECT user_id, username, email, password_hash, full_name, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // AUTO-PROMOTE HARDCODED ADMIN FOR DEMO/USER REQUEST
    if (user.email === 'admin@gmail.com' && user.role !== 'admin') {
      console.log('👑 Auto-promoting admin@gmail.com to admin role');
      await pool.query("UPDATE users SET role = 'admin' WHERE user_id = $1", [user.user_id]);
      user.role = 'admin'; // Update local object for token generation
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await pool.query(
      'UPDATE users SET updated_at = NOW() WHERE user_id = $1',
      [user.user_id]
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        access_token: token,
        user: {
          id: user.user_id,
          full_name: user.full_name,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/* ======================================
   GET CURRENT USER
====================================== */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT user_id, full_name, username, email, role, phone, location, created_at FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        id: user.user_id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        location: user.location || '',
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ======================================
   GET USER PROFILE - FOR PROFILE PAGE
====================================== */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT user_id, full_name, username, email, role, phone, location, created_at FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      user: {
        user_id: user.user_id,
        name: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        location: user.location || '',
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('❌ Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ======================================
   UPDATE USER PROFILE - WITH PHONE & LOCATION
====================================== */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: parsed.error.errors
      });
    }
    const { name, username, phone, location } = parsed.data;

    const newFullName = name || username;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (newFullName) {
      updates.push(`full_name = $${paramCount}`);
      values.push(newFullName);
      paramCount++;

      updates.push(`username = $${paramCount}`);
      values.push(newFullName);
      paramCount++;
    }

    // ✅ ADD phone update
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount}`);
      values.push(phone || null);
      paramCount++;
    }

    // ✅ ADD location update
    if (location !== undefined) {
      updates.push(`location = $${paramCount}`);
      values.push(location || null);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await pool.query(
      `UPDATE users 
       SET ${updates.join(', ')} 
       WHERE user_id = $${paramCount} 
       RETURNING user_id, full_name, username, email, role, phone, location, created_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updatedUser = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        user_id: updatedUser.user_id,
        name: updatedUser.full_name,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone || '',
        location: updatedUser.location || '',
        created_at: updatedUser.created_at
      }
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};