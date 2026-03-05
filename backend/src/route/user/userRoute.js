import express from 'express';
import {
  getDashboardStats,
  getUserPosts,
  createPetPost,
  updatePetPost,
  deletePetPost,
  getAllUsers,
  blockUser,
  unblockUser,
  deleteAccount
} from '../../controller/user/userController.js';
import {
  addFavorite,
  removeFavorite,
  getUserFavorites
} from '../../controller/user/favoritesController.js';
import authenticateToken from '../../middleware/token-middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllUsers);
router.put('/:id/block', blockUser);
router.put('/:id/unblock', unblockUser);

router.get('/dashboard/stats', getDashboardStats);
router.get('/posts', getUserPosts);
router.delete('/me', deleteAccount);

router.post('/pets', createPetPost);
router.put('/pets/:id', updatePetPost);
router.delete('/pets/:id', deletePetPost);

router.post('/favorites', addFavorite);
router.delete('/favorites/:petId', removeFavorite);
router.get('/favorites', getUserFavorites);

export default router;