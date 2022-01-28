// /$$$$$$$$$                                                       /$$
// | $$_____/                                                      |__/
// | $$        /$$$$$$$  /$$$$$$  /$$$$$$$   /$$$$$$  /$$$$$$/$$$$  /$$  /$$$$$$$  /$$$$$$
// | $$$$$    /$$_____/ /$$__  $$| $$__  $$ /$$__  $$| $$_  $$_  $$| $$ /$$_____/ |____  $$
// | $$__/   | $$      | $$  \ $$| $$  \ $$| $$  \ $$| $$ \ $$ \ $$| $$| $$        /$$$$$$$
// | $$      | $$      | $$  | $$| $$  | $$| $$  | $$| $$ | $$ | $$| $$| $$       /$$__  $$
// | $$$$$$$$|  $$$$$$$|  $$$$$$/| $$  | $$|  $$$$$$/| $$ | $$ | $$| $$|  $$$$$$$|  $$$$$$$
// |________/ \_______/ \______/ |__/  |__/ \______/ |__/ |__/ |__/|__/ \_______/ \_______/

require('dotenv/config');

import * as fs from 'fs';
import path from 'path';

import { BOT_TOKEN, clientOptions } from './config';
import { EconomicaClient, EconomicaService } from './structures';

const client = new EconomicaClient(clientOptions);

const serviceFiles = fs.readdirSync(path.join(__dirname, './services')).sort();

(async function (serviceFiles: string[]) {
	for (const file of serviceFiles) {
		const service = new (await import(`./services/${file}`)).default() as EconomicaService;
		console.log(`Initializing service ${service.name}`);
		await service.execute(client);
	}
})(serviceFiles).then(() => {
	client.login(BOT_TOKEN).then(() => {
		console.log(`${client.user.username} logged in`);
	});
});
