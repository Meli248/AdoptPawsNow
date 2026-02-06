import express from 'express';
import {
  getDashboardStats,
  getUserPosts,
  createPetPost,
  updatePetPost,
  deletePetPost,
  getAllUsers,
  blockUser,
  unblockUser
} from '../../controller/user/userController.js';
import {
  addFavorite,
  removeFavorite,
  getUserFavorites
} from '../../controller/user/favoritesController.js';
import authenticateToken from '../../middleware/token-middleware.js';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

// ==========================
// ADMIN ROUTES
// ==========================
router.get('/', getAllUsers);
router.put('/:id/block', blockUser);
router.put('/:id/unblock', unblockUser);

// ==========================
// USER DASHBOARD ROUTES
// ==========================
// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/posts', getUserPosts);

// Pet management routes
router.post('/pets', createPetPost);
router.put('/pets/:id', updatePetPost);
router.delete('/pets/:id', deletePetPost);

// Favorites routes
router.post('/favorites', addFavorite);
router.delete('/favorites/:petId', removeFavorite);
router.get('/favorites', getUserFavorites);

export default router;