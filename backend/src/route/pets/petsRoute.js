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
  updateApplicationStatus
} from '../../controller/pets/petsController.js';

const router = express.Router();

// Pet routes - FIXED: Added upload middleware
router.get('/pets', getAllPets);
router.get('/pets/:id', getPetById);
router.post('/pets', upload.single('image'), createPet);  // ← ADDED upload.single('image')
router.put('/pets/:id', upload.single('image'), updatePet);  // ← ADDED upload.single('image')
router.delete('/pets/:id', deletePet);

// Application routes
router.post('/applications', createAdoptionApplication);
router.get('/applications', getAllApplications);
router.get('/applications/:id', getApplicationById);
router.patch('/applications/:id/status', updateApplicationStatus);

export default router;