const express = require('express');
const router = express.Router();
const {
  getAllPets,
  getMissingPets,
  getPetById,
  getFeaturedPets,
  getStats
} = require('../../controller/user/fileController');

router.get('/pets', getAllPets);
router.get('/pets/featured', getFeaturedPets);
router.get('/pets/missing', getMissingPets);
router.get('/pets/:id', getPetById);
router.get('/stats', getStats);

module.exports = router;