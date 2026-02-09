import express from 'express';
import {
    createSurrenderRequest,
    getAllSurrenderRequests,
    updateSurrenderStatus,
    getUserSurrenderRequests,
    updateSurrenderRequest,
    deleteSurrenderRequest
} from '../../controller/surrender/surrenderController.js';
import authenticateToken from '../../middleware/token-middleware.js';
import upload from '../../middleware/multerConfig.js';

const router = express.Router();

// All routes protected
router.use(authenticateToken);

// Submit request (User)
router.post('/', upload.single('image'), createSurrenderRequest);

// Get requests (Admin)
// Ideally add a middleware to check admin role here, but controller checks are also fine or rely on frontend hiding
router.get('/', getAllSurrenderRequests);

// Update status (Admin)
router.put('/:id/status', updateSurrenderStatus);

// Get user's requests
router.get('/my-requests', getUserSurrenderRequests);

// Update request (User)
router.put('/:id', upload.single('image'), updateSurrenderRequest);

// Delete request (User)
router.delete('/:id', deleteSurrenderRequest);

export default router;
