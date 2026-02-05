import express from 'express';
import upload from '../../middleware/multerConfig.js';
import {
  getAllMissingPets,
  getMissingPetById,
  reportMissingPet,
  updateMissingPet,
  deleteMissingPet,
  getSightingsForPet,
  reportSighting,
  getAllSightings,
  updateMissingPetStatus,
  getUserMissingPets  // ✅ ADDED
} from '../../controller/missing/missingController.js';
import authenticateToken from '../../middleware/token-middleware.js';

const router = express.Router();

// Missing pets routes
router.get('/missing-pets', getAllMissingPets);
router.get('/missing-pets/:id', getMissingPetById);
router.post('/missing-pets', authenticateToken, upload.single('image'), reportMissingPet);
router.put('/missing-pets/:id', authenticateToken, upload.single('image'), updateMissingPet); // ✅ ADDED auth
router.delete('/missing-pets/:id', authenticateToken, deleteMissingPet); // ✅ ADDED auth
router.patch('/missing-pets/:id/status', updateMissingPetStatus);

// User's missing pets route - PROTECTED ✅ ADDED
router.get('/my-posts', authenticateToken, getUserMissingPets);

// Legacy routes (keep for backward compatibility)
router.get('/missing', getAllMissingPets);
router.get('/missing/:id', getMissingPetById);
router.post('/missing/report', authenticateToken, upload.single('image'), reportMissingPet);
router.put('/missing/:id', authenticateToken, upload.single('image'), updateMissingPet); // ✅ ADDED auth
router.delete('/missing/:id', authenticateToken, deleteMissingPet); // ✅ ADDED auth
router.patch('/missing/:id/status', updateMissingPetStatus);

// Sightings routes
router.get('/missing/:id/sightings', getSightingsForPet);
router.post('/sightings', reportSighting);
router.get('/sightings', getAllSightings);

export default router;