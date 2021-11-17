const { Client, Collection, Intents } = require('discord.js');
const util = require('./util/util');

require('dotenv').config();

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_BANS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.DIRECT_MESSAGES
	],
});

global.client = client;
global.util = util;

const ready = require('./events/ready');

client.on('ready', async () => {
	ready.run();
});

const interactionCreate = require('./events/interactionCreate');

client.on('interactionCreate', async (interaction) => {
	try {
		interactionCreate.run(interaction);
	} catch (err) {
		util.runtimeError(client, err, interaction);
	}
});

client.on('guildCreate', (guild) => {
	util.initGuildSettings(guild);
});

client.login(process.env.ECON_ALPHA_TOKEN);

process.on('unhandledRejection', async (err) => {
	await util.runtimeError(err);
});

process.on('uncaughtException', async (err) => {
	await util.runtimeError(err);
});
