import Notification from '../../models/Notification.js';

// Get user notifications
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;

        const notifications = await Notification.findByUserId(userId);

        res.status(200).json({
            success: true,
            data: notifications
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

        const notification = await Notification.markAsRead(id, userId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.userId;

        const count = await Notification.countUnread(userId);

        res.status(200).json({
            success: true,
            count: count
        });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Helper function to create notification (for internal use)
export const createNotification = async (userId, message, type = 'info', imageUrl = null) => {
    try {
        await Notification.create(userId, message, type, imageUrl);
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};
