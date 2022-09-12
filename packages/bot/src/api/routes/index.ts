import express from 'express';

import { bot } from '../..';
import { DISCORD_INVITE_URL, inviteOptions } from '../../config';
import authRoutes from './auth';
import commandRoutes from './commands';
import guildRoutes from './guilds';
import userRoutes from './users';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/commands', commandRoutes);
router.use('/guilds', guildRoutes);
router.use('/users', userRoutes);

router.use('/invite', (req, res) => res.redirect(bot.generateInvite(inviteOptions)));
router.use('/support', (req, res) => res.redirect(DISCORD_INVITE_URL));

export default router;
