import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema, updateProfileSchema } from '../../validation/schemas.js';
import User from '../../models/User.js';

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

    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const username = email.split('@')[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      hashedPassword,
      fullName,
      role: 'user'
    });

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

    let user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // AUTO-PROMOTE HARDCODED ADMIN FOR DEMO/USER REQUEST
    if (user.email === 'admin@gmail.com' && user.role !== 'admin') {
      console.log('👑 Auto-promoting admin@gmail.com to admin role');
      await User.updateRole(user.user_id, 'admin');
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

    await User.updateLastLogin(user.user_id);

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
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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

    // Call User model to handle dynamic query creation
    const user = await User.updateProfile(userId, parsed.data);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
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
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};