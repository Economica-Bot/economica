import * as fs from 'fs';
import * as path from 'path';

import { EconomicaClient, EconomicaService } from '../structures';

export default class implements EconomicaService {
	name = 'load-events';
	execute = (client: EconomicaClient) => {
		console.log(`Executing service ${this.name}`);
		const eventFiles = fs.readdirSync(path.join(__dirname, '../events'));
		eventFiles.forEach(async (file: string) => {
			const event = require(`../events/${file}`);
			client.on(event.name, async (...args) => {
				await event.execute(client, ...args);
			});
			console.log(`Loading event ${event.name}`);
		});
	};
}
