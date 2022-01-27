// /$$$$$$$$$                                                       /$$
// | $$_____/                                                      |__/
// | $$        /$$$$$$$  /$$$$$$  /$$$$$$$   /$$$$$$  /$$$$$$/$$$$  /$$  /$$$$$$$  /$$$$$$
// | $$$$$    /$$_____/ /$$__  $$| $$__  $$ /$$__  $$| $$_  $$_  $$| $$ /$$_____/ |____  $$
// | $$__/   | $$      | $$  \ $$| $$  \ $$| $$  \ $$| $$ \ $$ \ $$| $$| $$        /$$$$$$$
// | $$      | $$      | $$  | $$| $$  | $$| $$  | $$| $$ | $$ | $$| $$| $$       /$$__  $$
// | $$$$$$$$|  $$$$$$$|  $$$$$$/| $$  | $$|  $$$$$$/| $$ | $$ | $$| $$|  $$$$$$$|  $$$$$$$
// |________/ \_______/ \______/ |__/  |__/ \______/ |__/ |__/ |__/|__/ \_______/ \_______/
require('dotenv/config');

import fs from 'fs';
import path from 'path';

import { clientOptions } from './config';
import { EconomicaClient, EconomicaService } from './structures';
import { runtimeError } from './util/util';

const client = new EconomicaClient(clientOptions);

const serviceFiles = fs.readdirSync(path.join(__dirname, './services'));
serviceFiles.forEach(async (file) => {
	const service = new (await import(`./services/${file}`)).default() as EconomicaService;
	console.log(`Initializing service ${service.name}`);
	await service.execute(client);
});

client.login(process.env.ECON_CHAD_TOKEN).then(() => {
	console.log(`${client.user.username} logged in`);
});

client.on('error', console.error);
client.on('warn', console.warn);
client.on('invalidRequestWarning', console.error);

process.on('unhandledRejection', async (err: Error) => await runtimeError(client, err));
process.on('uncaughtException', async (err: Error) => await runtimeError(client, err));
process.on('rejectionHandled', async (err: Error) => await runtimeError(client, err));
