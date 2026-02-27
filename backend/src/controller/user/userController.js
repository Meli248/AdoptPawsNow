import { petSchema, updatePetSchema } from '../../validation/schemas.js';
import Pet from '../../models/Pet.js';
import User from '../../models/User.js';

// Get User Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const totalPosts = await Pet.countByUserIdAndStatus(userId);
    const adoptedPets = await Pet.countByUserIdAndStatus(userId, 'adopted');
    const availablePets = await Pet.countByUserIdAndStatus(userId, 'available');

    res.status(200).json({
      success: true,
      data: {
        totalPosts: totalPosts,
        adopted: adoptedPets,
        missing: 0,
        available: availablePets
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

    const posts = await Pet.findByUserId(userId);

    res.status(200).json({
      success: true,
      data: posts
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

    const pet = await Pet.create({
      userId,
      ...validatedData
    });

    res.status(201).json({
      success: true,
      message: 'Pet post created successfully',
      data: pet
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

    const petCheck = await Pet.findById(id);

    if (!petCheck || petCheck.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found or unauthorized'
      });
    }

    const updatedPet = await Pet.update(id, validatedData);

    res.status(200).json({
      success: true,
      message: 'Pet post updated successfully',
      data: updatedPet
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

    const deletedPet = await Pet.delete(id, userId);

    if (!deletedPet) {
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
    const users = await User.findAllWithStats();

    res.status(200).json({
      success: true,
      data: users
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

    const updatedUser = await User.updateStatus(id, 'blocked');

    if (!updatedUser) {
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

    const updatedUser = await User.updateStatus(id, 'active');

    if (!updatedUser) {
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
