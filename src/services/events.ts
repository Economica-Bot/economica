import { Client } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

export const name = 'events';

export async function execute(client: Client) {
	const eventFiles = fs.readdirSync(path.join(__dirname, '../events'));
	eventFiles.forEach(async (file: string) => {
		const event = require(`../events/${file}`);
		client.on(event.name, async (...args) => {
			await event.execute(client, ...args);
		});
		console.log(`Loading event ${event.name}`);
	});
}
