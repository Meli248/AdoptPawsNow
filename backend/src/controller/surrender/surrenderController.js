import pool from '../../database/index.js';

// Submit a surrender request
export const createSurrenderRequest = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            pet_name,
            pet_type,
            breed,
            age,
            gender,
            reason,
            image_url, // Allow URL string directly or handle file upload in route
            contact_phone
        } = req.body;

        // Validate required fields
        if (!pet_name || !pet_type || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Pet name, type, and reason for surrender are required'
            });
        }

        // Handle image if file uploaded (middleware should handle this before controller)
        const finalImage = req.file ? `/uploads/${req.file.filename}` : image_url;

        const result = await pool.query(
            `INSERT INTO surrender_applications 
      (user_id, pet_name, pet_type, breed, age, gender, reason, image_url, contact_phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
            [userId, pet_name, pet_type, breed, age, gender, reason, finalImage, contact_phone]
        );

        res.status(201).json({
            success: true,
            message: 'Surrender request submitted successfully. We will review it shortly.',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating surrender request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit request',
            error: error.message
        });
    }
};

// Get all surrender requests (Admin only)
export const getAllSurrenderRequests = async (req, res) => {
    try {
        const { status } = req.query;

        let query = `
      SELECT s.*, u.full_name as user_name, u.email as user_email
      FROM surrender_applications s
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
        console.error('Error fetching surrender requests:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update surrender request status
export const updateSurrenderStatus = async (req, res) => {
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
            'UPDATE surrender_applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE application_id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Status updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating surrender status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
