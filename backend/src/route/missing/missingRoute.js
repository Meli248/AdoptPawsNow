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
  updateMissingPetStatus
} from '../../controller/missing/missingController.js';

const router = express.Router();

// Missing pets routes
router.get('/missing-pets', getAllMissingPets);
router.get('/missing-pets/:id', getMissingPetById);
router.post('/missing-pets', upload.single('image'), reportMissingPet);
router.put('/missing-pets/:id', upload.single('image'), updateMissingPet);
router.delete('/missing-pets/:id', deleteMissingPet);
router.patch('/missing-pets/:id/status', updateMissingPetStatus);

// Legacy routes (keep for backward compatibility)
router.get('/missing', getAllMissingPets);
router.get('/missing/:id', getMissingPetById);
router.post('/missing/report', upload.single('image'), reportMissingPet);
router.put('/missing/:id', upload.single('image'), updateMissingPet);
router.delete('/missing/:id', deleteMissingPet);
router.patch('/missing/:id/status', updateMissingPetStatus);

// Sightings routes
router.get('/missing/:id/sightings', getSightingsForPet);
router.post('/sightings', reportSighting);
router.get('/sightings', getAllSightings);

export default router;