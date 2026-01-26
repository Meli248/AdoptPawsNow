import express from 'express';
import {
  getDashboardStats,
  getUserPosts,
  createPetPost,
  updatePetPost,
  deletePetPost
} from '../../controller/user/userController.js';
import authenticateToken from '../../middleware/token-middleware.js';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/posts', getUserPosts);

// Pet management routes
router.post('/pets', createPetPost);
router.put('/pets/:id', updatePetPost);
router.delete('/pets/:id', deletePetPost);

export default router;