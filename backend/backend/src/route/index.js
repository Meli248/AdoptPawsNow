const express = require('express');
const router = express.Router();
const {
  getAllPets,
  getMissingPets,
  getPetById,
  getFeaturedPets,
  getStats
} = require('../../controller/user/fileController');

// Public routes - no authentication required
router.get('/pets', getAllPets);
router.get('/pets/featured', getFeaturedPets);
router.get('/pets/missing', getMissingPets);
router.get('/pets/:id', getPetById);
router.get('/stats', getStats);

module.exports = router;