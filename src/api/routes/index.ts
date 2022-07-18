import express from 'express';

import authRoutes from './auth';
import commandRoutes from './commands';
import guildRoutes from './guilds';
import userRoutes from './users';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/commands', commandRoutes);
router.use('/guilds', guildRoutes);
router.use('/users', userRoutes);

export default router;
