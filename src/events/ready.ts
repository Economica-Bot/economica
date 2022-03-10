/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEPLOY_COMMANDS, DEVELOPMENT_GUILD_IDS, PRODUCTION } from '../config.js';
import { Economica, Event } from '../structures/index.js';
import { Modules } from '../typings/index.js';

export default class implements Event {
	public event = 'ready' as const;
	public async execute(client: Economica) {
		if (DEPLOY_COMMANDS === 0) {
			client.log.info('Commands Idle');
		} else if (DEPLOY_COMMANDS === 1) {
			await this.updateCommands(client);
		} else if (DEPLOY_COMMANDS === 2) {
			await this.resetCommands(client);
			await this.updateCommands(client);
		}

		client.log.info('Commands registered');
		client.log.info(`${client.user.tag} Ready`);
	}

	private async updateCommands(client: Economica) {
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
	}

	private async resetCommands(client: Economica) {
		DEVELOPMENT_GUILD_IDS.forEach(async (id) => {
			const guild = await client.guilds.fetch(id);
			await guild.commands.set([]);
			client.log.debug(`Reset commands in dev guild ${guild.name}`);
		});

		if (PRODUCTION) {
			await client.application.commands.set([]);
			client.log.debug('Reset global commands');
		}
	}
}
