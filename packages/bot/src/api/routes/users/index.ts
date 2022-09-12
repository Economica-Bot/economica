import { RESTGetAPICurrentUserGuildsResult, Routes } from 'discord-api-types/v10';
import { PermissionsBitField } from 'discord.js';
import express from 'express';

import { bot } from '../../..';
import { Token } from '../../../entities';

const router = express.Router();

router.get('/@me', async (req, res) => {
	const token = req.user as Token;
	const user = await bot.rest
		.get(`${Routes.user()}`, { auth: false, headers: { Authorization: `Bearer ${token?.accessToken}` } })
		.catch(() => null);
	if (!user) {
		res.sendStatus(404);
		return;
	}

	res.send(user);
});

router.get('/@me/guilds', async (req, res) => {
	const token = req.user as Token;
	if (!token) {
		res.sendStatus(404);
		return;
	}
	const guilds = (await bot.rest.get(`${Routes.userGuilds()}`, {
		auth: false,
		headers: { Authorization: `Bearer ${token?.accessToken}` },
	})) as RESTGetAPICurrentUserGuildsResult;
	if (!guilds) {
		res.sendStatus(404);
		return;
	}

	const guildsWithAdmin = guilds.filter((guild) => new PermissionsBitField(BigInt(guild.permissions)).has('Administrator'));
	res.send(guildsWithAdmin);
});

router.get('/:userId', async (req, res) => {
	const { userId } = req.params;
	const user = await bot.users.fetch(userId).catch(() => null);
	if (!user) {
		res.sendStatus(404);
		return;
	}

	res.status(200).send(user);
});

export default router;
