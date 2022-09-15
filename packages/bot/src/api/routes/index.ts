import express from 'express';

import { DISCORD_INVITE_URL } from '../../config';
import interactionRoutes from './interactions';
import protectedRoutes from './protected';

const router = express.Router();

router
	.use('/interactions', interactionRoutes)
	.use(protectedRoutes);

// router.use('/invite', (req, res) => res.redirect(bot.generateInvite(inviteOptions)));
router.use('/support', (req, res) => res.redirect(DISCORD_INVITE_URL));

export const routes = router;
