import express from 'express';
import { Guild as DiscordGuild } from 'discord.js';

import { Guild, User } from '../../../../entities/index.js';
import { bot } from '../../../../index.js';
import { isAuthenticated } from '../../../utilities/middleWares.js';
import infractionsRoutes from './infractions/index.js';
import membersRoutes from './members/index.js';
import transactionsRoutes from './transactions/index.js';

const router = express.Router();

router.get('/', isAuthenticated, async (req, res) => {
	const user = req.user as User;
	const guilds = (await Promise.all(bot.guilds.cache.map(async (guild) => {
		const member = await guild.members.fetch(user.id).catch(() => null);
		return member?.permissions?.has('Administrator') ? guild : false;
	}))).filter(Boolean).map(async (guild: DiscordGuild) => {
		const botGuild = await Guild.findOne({ where: { id: guild.id } });
		return botGuild;
	});
	res.send(await Promise.all(guilds));
});

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

router.put('/:guildId', async (req, res) => {
	const { guildId } = req.params;
	const guild = await Guild.findOne({ where: { id: guildId } });
	if (!guild) {
		res.sendStatus(404);
		return;
	}

	Object.assign(guild, req.body);
	await guild.save();
	res.sendStatus(204);
});

router.get('/:guildId/permissions', async (req, res) => {
	const user = req.user as User;
	const { guildId } = req.params;
	const guilds = bot.guilds.cache.filter((guild) => (
		guild.members.cache.some((member) => (member.id === user.id && member.permissions.has('Administrator')))
	));
	const valid = guilds.some((guild) => guild.id === guildId);
	return valid ? res.sendStatus(200) : res.sendStatus(403);
});

router.use('/:guildId/infractions', infractionsRoutes);
router.use('/:guildId/members', membersRoutes);
router.use('/:guildId/transactions', transactionsRoutes);

export default router;
