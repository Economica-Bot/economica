import express from 'express';

import authRoutes from './auth/index.js';
import commandRoutes from './commands/index.js';
import guildRoutes from './guilds/index.js';
import userRoutes from './users/index.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/commands', commandRoutes);
router.use('/guilds', guildRoutes);
router.use('/users', userRoutes);

export default router;
