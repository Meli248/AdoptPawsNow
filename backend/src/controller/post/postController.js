import pool from '../../database/index.js';
import { createNotification } from '../notification/notificationController.js';
import { postRequestSchema } from '../../validation/schemas.js';

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

        const {
            pet_name,
            pet_type,
            breed,
            age,
            gender,
            reason,
            contact_name,
            contact_email,
            contact_phone,
            location
        } = parsed.data;

        // Handle image if file uploaded (middleware should handle this before controller)
        const finalImage = req.file ? `/uploads/${req.file.filename}` : (req.body.image_url || null);

        const result = await pool.query(
            `INSERT INTO post_applications 
      (user_id, pet_name, pet_type, breed, age, gender, reason, image_url, contact_name, contact_email, contact_phone, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
            [userId, pet_name, pet_type, breed, age, gender, reason, finalImage, contact_name, contact_email, contact_phone, location]
        );

        res.status(201).json({
            success: true,
            message: 'Post request submitted successfully. We will review it shortly.',
            data: result.rows[0]
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

        let query = `
      SELECT s.*, u.full_name as user_name, u.email as user_email
      FROM post_applications s
      JOIN users u ON s.user_id = u.user_id
    `;

        const params = [];

        if (status) {
            query += ' WHERE s.status = $1';
            params.push(status);
        }

        query += ' ORDER BY s.created_at DESC';

        const result = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: result.rows
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

        const result = await pool.query(
            'UPDATE post_applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE application_id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        const postRequest = result.rows[0];

        // If approved, create a new pet listing
        if (status === 'approved') {
            await pool.query(
                `INSERT INTO pets (
                    user_id, name, species, breed, age, gender, description, 
                    image_url, contact_phone, contact_type, location, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                [
                    postRequest.user_id,
                    postRequest.pet_name,
                    postRequest.pet_type,
                    postRequest.breed,
                    postRequest.age,
                    postRequest.gender,
                    postRequest.reason, // Use reason as description
                    postRequest.image_url,
                    postRequest.contact_phone,
                    'individual', // Default contact type
                    postRequest.location,
                    'available'
                ]
            );
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

        const result = await pool.query(
            `SELECT * FROM post_applications 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [userId]
        );

        res.status(200).json({
            success: true,
            data: result.rows
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
        const {
            pet_name,
            pet_type,
            breed,
            age,
            gender,
            reason,
            contact_name,
            contact_email,
            contact_phone,
            location
        } = req.body;

        // Check if request exists and belongs to user
        const checkResult = await pool.query(
            'SELECT * FROM post_applications WHERE application_id = $1 AND user_id = $2',
            [id, userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Request not found or unauthorized'
            });
        }

        // Handle image if file uploaded
        const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;

        let query = `
            UPDATE post_applications 
            SET pet_name = COALESCE($1, pet_name),
                pet_type = COALESCE($2, pet_type),
                breed = COALESCE($3, breed),
                age = COALESCE($4, age),
                gender = COALESCE($5, gender),
                reason = COALESCE($6, reason),
                contact_name = COALESCE($7, contact_name),
                contact_email = COALESCE($8, contact_email),
                contact_phone = COALESCE($9, contact_phone),
                location = COALESCE($10, location),
                updated_at = CURRENT_TIMESTAMP
        `;

        const params = [pet_name, pet_type, breed, age, gender, reason, contact_name, contact_email, contact_phone, location];

        if (image_url) {
            query += `, image_url = $${params.length + 1}`;
            params.push(image_url);
        }

        query += ` WHERE application_id = $${params.length + 1} RETURNING *`;
        params.push(id);

        const result = await pool.query(query, params);

        res.status(200).json({
            success: true,
            message: 'Request updated successfully',
            data: result.rows[0]
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

        const result = await pool.query(
            'DELETE FROM post_applications WHERE application_id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
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
