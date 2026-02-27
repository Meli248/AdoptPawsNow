import { createNotification } from '../notification/notificationController.js';
import { postRequestSchema } from '../../validation/schemas.js';
import Post from '../../models/Post.js';
import Pet from '../../models/Pet.js';

// Submit a post request
export const createPostRequest = async (req, res) => {
    try {
        const userId = req.user.userId;

        const parsed = postRequestSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: parsed.error.errors
            });
        }

        const image_url = req.file ? `/uploads/${req.file.filename}` : (req.body.image_url || null);

        const postRequest = await Post.create({
            userId,
            ...parsed.data,
            image_url
        });

        res.status(201).json({
            success: true,
            message: 'Post request submitted successfully. We will review it shortly.',
            data: postRequest
        });
    } catch (error) {
        console.error('Error creating post request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit request',
            error: error.message
        });
    }
};

// Get all post requests (Admin only)
export const getAllPostRequests = async (req, res) => {
    try {
        const { status } = req.query;

        const postRequests = await Post.findAll({ status });

        res.status(200).json({
            success: true,
            data: postRequests
        });
    } catch (error) {
        console.error('Error fetching post requests:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update post request status
export const updatePostStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const postRequest = await Post.updateStatus(id, status);

        if (!postRequest) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // If approved, create a new pet listing
        if (status === 'approved') {
            await Pet.create({
                userId: postRequest.user_id,
                name: postRequest.pet_name,
                species: postRequest.pet_type,
                breed: postRequest.breed,
                age: postRequest.age,
                gender: postRequest.gender,
                description: postRequest.reason, // Use reason as description
                image_url: postRequest.image_url,
                contact_phone: postRequest.contact_phone,
                contact_type: 'individual',
                location: postRequest.location,
                status: 'available'
            });
        }

        const message = status === 'approved'
            ? `Your post request for ${postRequest.pet_name} has been approved. The pet is now listed as Available for adoption.`
            : `Your post request for ${postRequest.pet_name} has been ${status}.`;

        // Notify the user
        await createNotification(
            postRequest.user_id,
            message,
            'post_update',
            postRequest.image_url
        );

        res.status(200).json({
            success: true,
            message: 'Status updated successfully',
            data: postRequest
        });
    } catch (error) {
        console.error('Error updating post status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get user's post requests
export const getUserPostRequests = async (req, res) => {
    try {
        const userId = req.user.userId;

        const postRequests = await Post.findByUserId(userId);

        res.status(200).json({
            success: true,
            data: postRequests
        });
    } catch (error) {
        console.error('Error fetching user post requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch post requests',
            error: error.message
        });
    }
};

// Update post request (User)
export const updatePostRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Check if request exists and belongs to user
        const existing = await Post.findByIdAndUser(id, userId);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Request not found or unauthorized'
            });
        }

        // Handle image if file uploaded
        const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;

        const updatedRequest = await Post.update(id, userId, { ...req.body, image_url });

        res.status(200).json({
            success: true,
            message: 'Request updated successfully',
            data: updatedRequest
        });
    } catch (error) {
        console.error('Error updating post request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update request',
            error: error.message
        });
    }
};

// Delete post request (User)
export const deletePostRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const deletedRequest = await Post.delete(id, userId);

        if (!deletedRequest) {
            return res.status(404).json({
                success: false,
                message: 'Request not found or unauthorized'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Request deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting post request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete request',
            error: error.message
        });
    }
};
