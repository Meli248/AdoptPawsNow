import express from 'express';
import { getHomeStats } from '../../controller/stats/statsController.js';

const router = express.Router();

// Public route - anyone can see stats
router.get('/home', getHomeStats);

export default router;