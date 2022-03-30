import express from 'express';

import { Guild } from '../../../entities/index.js';
import { isAuthenticated } from '../../utilities/middleWares.js';
import { getGuildsController } from '../../controllers/guilds/index.js';
import infractionsRoutes from './infractions/index.js';
import membersRoutes from './members/index.js';
import transactionsRoutes from './transactions/index.js';

const router = express.Router();

router.get('/', isAuthenticated, getGuildsController, (_req, res) => res.sendStatus(200));

router.use('/:guildId', async (req, res, next) => {
	const { guildId } = req.params;
	const guild = await Guild.findOne({ where: { id: guildId } });
	if (!guild) {
		res.sendStatus(404);
		return;
	}

	res.locals.guild = guild;
	next();
});

router.get('/:guildId', async (_req, res) => {
	res.status(200).send(res.locals.guild);
});

router.use('/:guildId/infractions', infractionsRoutes);
router.use('/:guildId/members', membersRoutes);
router.use('/:guildId/transactions', transactionsRoutes);

export default router;
