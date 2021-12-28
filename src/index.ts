// /$$$$$$$$$                                                       /$$
// | $$_____/                                                      |__/
// | $$        /$$$$$$$  /$$$$$$  /$$$$$$$   /$$$$$$  /$$$$$$/$$$$  /$$  /$$$$$$$  /$$$$$$
// | $$$$$    /$$_____/ /$$__  $$| $$__  $$ /$$__  $$| $$_  $$_  $$| $$ /$$_____/ |____  $$
// | $$__/   | $$      | $$  \ $$| $$  \ $$| $$  \ $$| $$ \ $$ \ $$| $$| $$        /$$$$$$$
// | $$      | $$      | $$  | $$| $$  | $$| $$  | $$| $$ | $$ | $$| $$| $$       /$$__  $$
// | $$$$$$$$|  $$$$$$$|  $$$$$$/| $$  | $$|  $$$$$$/| $$ | $$ | $$| $$|  $$$$$$$|  $$$$$$$
// |________/ \_______/ \______/ |__/  |__/ \______/ |__/ |__/ |__/|__/ \_______/ \_______/

import { Intents } from 'discord.js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

import EconomicaClient from './structures/EconomicaClient';

dotenv.config();

const client = new EconomicaClient({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_BANS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.DIRECT_MESSAGES,
	],
});

const serviceFiles = fs.readdirSync('./services');
serviceFiles.forEach(async (file) => {
	const service = await import(`./services/${file}`);
	console.log(`Executing service ${service.name}...`);
	await service.execute(client);
});

client.login(process.env.ECON_ALPHA_TOKEN).then(() => {
	console.log(`${client.user.username} logged in`);
});

// process.on('unhandledRejection', async (err) => await util.runtimeError(client, err));
// process.on('uncaughtException', async (err) => await util.runtimeError(client, err));
// process.on('rejectionHandled', async (err) => await util.runtimeError(client, err));
