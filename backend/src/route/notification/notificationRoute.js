import express from 'express';
import { getUserNotifications, markNotificationAsRead } from '../../controller/notification/notificationController.js';
import authenticateToken from '../../middleware/token-middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getUserNotifications);
router.put('/:id/read', markNotificationAsRead);

export default router;
