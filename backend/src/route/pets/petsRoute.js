import express from 'express';
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

// Pet routes
router.get('/pets', getAllPets);
router.get('/pets/:id', getPetById);
router.post('/pets', createPet);
router.put('/pets/:id', updatePet);
router.delete('/pets/:id', deletePet);

// Application routes
router.post('/applications', createAdoptionApplication);
router.get('/applications', getAllApplications);
router.get('/applications/:id', getApplicationById);
router.patch('/applications/:id/status', updateApplicationStatus);

export default router;