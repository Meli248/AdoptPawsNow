const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUserPosts,
  createPetPost,
  updatePetPost,
  deletePetPost
} = require('../../controller/user/userController');
const authenticateToken = require('../../middleware/token-middleware');

// All routes are protected
router.use(authenticateToken);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/posts', getUserPosts);

// Pet management routes
router.post('/pets', createPetPost);
router.put('/pets/:id', updatePetPost);
router.delete('/pets/:id', deletePetPost);

module.exports = router;