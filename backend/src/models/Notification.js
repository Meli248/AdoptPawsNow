import pool from '../database/index.js';

class Notification {
    static async findByUserId(userId, limit = 50) {
        const result = await pool.query(
            `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    }

    static async markAsRead(notificationId, userId) {
        const result = await pool.query(
            `UPDATE notifications 
       SET is_read = TRUE 
       WHERE notification_id = $1 AND user_id = $2 
       RETURNING *`,
            [notificationId, userId]
        );
        return result.rows[0];
    }

    static async countUnread(userId) {
        const result = await pool.query(
            'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
            [userId]
        );
        return parseInt(result.rows[0].count, 10);
    }

    static async create(userId, message, type = 'info', imageUrl = null) {
        const result = await pool.query(
            `INSERT INTO notifications (user_id, message, type, image_url) 
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [userId, message, type, imageUrl]
        );
        return result.rows[0];
    }
}

export default Notification;
