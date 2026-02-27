import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageHelper';
import '../css/Notification.css';

const Notification = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            if (!token) return;

            const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            await fetch(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setNotifications(prev =>
                prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.notification_id);
        }
        // Navigate based on notification type if needed
        // if (notification.type === 'post_update') navigate('/profile');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        // If less than 24 hours
        if (diff < 86400000) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString();
    };

    if (!isOpen) return null;

    return (
        <div className="notification-dropdown">
            <div className="notification-header">
                <h3>Notifications</h3>
                <button className="close-btn" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>

            <div className="notification-list">
                {loading ? (
                    <div className="notification-loading">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="notification-empty">No notifications</div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.notification_id}
                            className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            {notification.image_url && (
                                <div className="notification-image">
                                    <img src={getImageUrl(notification.image_url)} alt="Preview" />
                                </div>
                            )}
                            <div className="notification-content">
                                <p>{notification.message}</p>
                                <span className="notification-time">{formatDate(notification.created_at)}</span>
                            </div>
                            {!notification.is_read && <div className="notification-dot" />}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notification;
