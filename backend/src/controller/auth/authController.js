import pool from '../../database/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/* ======================================
   REGISTER USER
====================================== */
export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    console.log('📝 Registration attempt:', { fullName, email });

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user exists
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

    console.log('🔐 Creating user with:', { username, email, fullName });

    // INSERT USER - exact same format as the successful test query
    const insertQuery = `
      INSERT INTO users (username, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, username, email, full_name, role, created_at
    `;
    
    const values = [username, email, hashedPassword, fullName, 'user'];
    
    console.log('📊 Executing insert...');
    
    const result = await pool.query(insertQuery, values);

    const user = result.rows[0];
    
    console.log('✅ User created successfully:', { user_id: user.user_id, username: user.username });

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
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      position: error.position
    });
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
    const { email, password } = req.body;

    console.log('🔑 Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

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

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ Login successful for:', user.username);

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
      'SELECT user_id, full_name, username, email, role, created_at FROM users WHERE user_id = $1',
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