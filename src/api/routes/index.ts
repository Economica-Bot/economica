import express from 'express';

import botRoutes from './bot/index.js';
import wsRoutes from './ws/index.js';

const router = express.Router();

router.use('/bot', botRoutes);
router.use('/ws', wsRoutes);

export default router;
