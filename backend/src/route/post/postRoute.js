import express from 'express';
import {
    createPostRequest,
    getAllPostRequests,
    updatePostStatus,
    getUserPostRequests,
    updatePostRequest,
    deletePostRequest
} from '../../controller/post/postController.js';
import authenticateToken from '../../middleware/token-middleware.js';
import upload from '../../middleware/multerConfig.js';

const router = express.Router();

// All routes protected
router.use(authenticateToken);

// Submit request (User)
router.post('/', upload.single('image'), createPostRequest);

// Get requests (Admin)
// Ideally add a middleware to check admin role here, but controller checks are also fine or rely on frontend hiding
router.get('/', getAllPostRequests);

// Update status (Admin)
router.put('/:id/status', updatePostStatus);

// Get user's requests
router.get('/my-requests', getUserPostRequests);

// Update request (User)
router.put('/:id', upload.single('image'), updatePostRequest);

// Delete request (User)
router.delete('/:id', deletePostRequest);

export default router;
