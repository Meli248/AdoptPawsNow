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
router.get('/', getAllPets);
router.get('/:id', getPetById);
router.post('/', authenticateToken, upload.single('image'), createPet);
router.put('/:id', authenticateToken, upload.single('image'), updatePet); // Matches /api/pets/:id
router.delete('/:id', authenticateToken, deletePet); // Matches /api/pets/:id

// User's pets route - PROTECTED ✅ ADDED
router.get('/my-posts', authenticateToken, getUserPets);

// Application routes
router.post('/applications', createAdoptionApplication);
router.get('/applications', getAllApplications);
router.get('/applications/:id', getApplicationById);
router.patch('/applications/:id/status', updateApplicationStatus);

export default router;