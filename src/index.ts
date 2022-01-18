// /$$$$$$$$$                                                       /$$
// | $$_____/                                                      |__/
// | $$        /$$$$$$$  /$$$$$$  /$$$$$$$   /$$$$$$  /$$$$$$/$$$$  /$$  /$$$$$$$  /$$$$$$
// | $$$$$    /$$_____/ /$$__  $$| $$__  $$ /$$__  $$| $$_  $$_  $$| $$ /$$_____/ |____  $$
// | $$__/   | $$      | $$  \ $$| $$  \ $$| $$  \ $$| $$ \ $$ \ $$| $$| $$        /$$$$$$$
// | $$      | $$      | $$  | $$| $$  | $$| $$  | $$| $$ | $$ | $$| $$| $$       /$$__  $$
// | $$$$$$$$|  $$$$$$$|  $$$$$$/| $$  | $$|  $$$$$$/| $$ | $$ | $$| $$|  $$$$$$$|  $$$$$$$
// |________/ \_______/ \______/ |__/  |__/ \______/ |__/ |__/ |__/|__/ \_______/ \_______/

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Intents } from 'discord.js';
import { EconomicaClient } from './structures/EconomicaClient';
import { runtimeError } from './util/util';
import { EconomicaService } from './structures';

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

const serviceFiles = fs.readdirSync(path.join(__dirname, './services'));
serviceFiles.forEach(async (file) => {
	const service = new (await import(`./services/${file}`)).default;
	console.log(`Initializing service ${service.name}`);
	await service.execute(client);
});

client.login(process.env.ECON_ALPHA_TOKEN).then(() => {
	console.log(`${client.user.username} logged in`);
});

// process.on('unhandledRejection', async (err: Error) => await runtimeError(client, err));
// process.on('uncaughtException', async (err: Error) => await runtimeError(client, err));
// process.on('rejectionHandled', async (err: Error) => await runtimeError(client, err));
