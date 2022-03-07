/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEVELOPMENT_GUILD_IDS, PRODUCTION } from '../config.js';
import { Economica, Event } from '../structures/index.js';
import { Modules } from '../typings/index.js';

export default class implements Event {
	public event = 'ready' as const;
	public async execute(client: Economica) {
		const commandData: any[] = [];
		const defaultCommandData: any[] = [];
		client.commands.forEach((command) => {
			commandData.push(command.data.toJSON());
			if (Modules[command.data.module] === 'DEFAULT') {
				defaultCommandData.push(command.data.toJSON());
			}
		});

		DEVELOPMENT_GUILD_IDS.forEach(async (id) => {
			const guild = await client.guilds.fetch(id);
			await guild.commands.set(commandData);
			client.log.debug(`Registered commands in dev guild ${guild.name}`);
		});

		if (PRODUCTION) {
			await client.application.commands.set(defaultCommandData);
			client.log.debug('Registered global commands');
		}

		client.log.info('Commands registered');
		client.log.info(`${client.user.tag} Ready`);
	}
}
