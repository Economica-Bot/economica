import { ChannelType, Routes } from 'discord-api-types/v10';
import express from 'express';

import { bot } from '../../../..';
import { Guild } from '../../../../entities';
import { DefaultCurrencySymbol } from '../../../../typings';
import infractionsRoutes from './infractions';
import membersRoutes from './members';
import transactionsRoutes from './transactions';

const router = express.Router();

router.use('/:guildId', async (req, res, next) => {
	const { guildId } = req.params;
	const guild = await bot.rest.get(Routes.guild(guildId));
	if (!guild) {
		res.sendStatus(404);
		return;
	}

	res.locals.guild = guild;
	next();
});

router.get('/:guildId', async (req, res) => {
	res.send(res.locals.guild);
});

router.get('/:guildId/currency', async (req, res) => {
	const { guildId: id } = req.params;
	const botGuild = await Guild.findOneBy({ id });
	res.send(botGuild.currency);
});

router.put('/:guildId/currency', async (req, res) => {
	const { guildId: id } = req.params;
	const botGuild = await Guild.findOneBy({ id });
	const { currency } = req.body;
	botGuild.currency = currency;
	await botGuild.save();
	res.sendStatus(200);
});

router.put('/:guildId/currency/reset', async (req, res) => {
	const { guildId: id } = req.params;
	const botGuild = await Guild.findOneBy({ id });
	botGuild.currency = DefaultCurrencySymbol;
	await botGuild.save();
	res.sendStatus(200);
});

router.get('/:guildId/channels', async (req, res) => {
	const { guildId: id } = req.params;
	const channels = await bot.rest.get(Routes.guildChannels(id));
	const textChannels = channels.filter((channel) => channel.type === ChannelType.GuildText);
	res.send(textChannels);
});

router.get('/:guildId/transaction_log', async (req, res) => {
	const { guildId: id } = req.params;
	const guild = await Guild.findOneBy({ id });
	res.send({ transactionLogId: guild.transactionLogId });
});

router.put('/:guildId/transaction_log', async (req, res) => {
	const { guildId: id } = req.params;
	const { transactionLogId } = req.body;
	const guild = await Guild.findOneBy({ id });
	guild.transactionLogId = transactionLogId;
	await guild.save();
	res.sendStatus(200);
});

router.put('/:guildId/transaction_log/reset', async (req, res) => {
	const { guildId: id } = req.params;
	const guild = await Guild.findOneBy({ id });
	guild.transactionLogId = null;
	await guild.save();
	res.sendStatus(200);
});

router.get('/:guildId/infraction_log', async (req, res) => {
	const { guildId: id } = req.params;
	const guild = await Guild.findOneBy({ id });
	res.send({ infractionLogId: guild.infractionLogId });
});

router.put('/:guildId/infraction_log', async (req, res) => {
	const { guildId: id } = req.params;
	const { infractionLogId } = req.body;
	const guild = await Guild.findOneBy({ id });
	guild.infractionLogId = infractionLogId;
	await guild.save();
	res.sendStatus(200);
});

router.put('/:guildId/infraction_log/reset', async (req, res) => {
	const { guildId: id } = req.params;
	const guild = await Guild.findOneBy({ id });
	guild.infractionLogId = null;
	await guild.save();
	res.sendStatus(200);
});

router.use('/:guildId/infractions', infractionsRoutes);
router.use('/:guildId/members', membersRoutes);
router.use('/:guildId/transactions', transactionsRoutes);

export default router;
