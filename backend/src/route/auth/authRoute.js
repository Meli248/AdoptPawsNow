import express from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  getUserProfile, 
  updateUserProfile 
} from '../../controller/auth/authController.js';
import authenticateToken from '../../middleware/token-middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.get('/profile', authenticateToken, getUserProfile);  // ✅ ADDED
router.put('/profile', authenticateToken, updateUserProfile);  // ✅ ADDED

export default router;