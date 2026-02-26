import pool from '../../database/index.js';

// Get user notifications
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT * FROM notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [userId]
        );

        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `UPDATE notifications 
             SET is_read = TRUE 
             WHERE id = $1 AND user_id = $2 
             RETURNING *`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Helper function to create notification (for internal use)
export const createNotification = async (userId, message, type = 'info', imageUrl = null) => {
    try {
        await pool.query(
            `INSERT INTO notifications (user_id, message, type, image_url) 
             VALUES ($1, $2, $3, $4)`,
            [userId, message, type, imageUrl]
        );
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};
