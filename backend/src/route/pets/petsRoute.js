import express from 'express';
import upload from '../../middleware/multerConfig.js';
import {
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  createAdoptionApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  getUserPets  // ✅ ADDED
} from '../../controller/pets/petsController.js';
import authenticateToken from '../../middleware/token-middleware.js';

const router = express.Router();

// Public pet routes
router.get('/pets', getAllPets);
router.get('/pets/:id', getPetById);
router.post('/pets', authenticateToken, upload.single('image'), createPet);
router.put('/pets/:id', authenticateToken, upload.single('image'), updatePet); // ✅ ADDED auth
router.delete('/pets/:id', authenticateToken, deletePet); // ✅ ADDED auth

// User's pets route - PROTECTED ✅ ADDED
router.get('/my-posts', authenticateToken, getUserPets);

// Application routes
router.post('/applications', createAdoptionApplication);
router.get('/applications', getAllApplications);
router.get('/applications/:id', getApplicationById);
router.patch('/applications/:id/status', updateApplicationStatus);

export default router;