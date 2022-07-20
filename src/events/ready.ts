/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApplicationCommandDataResolvable } from 'discord.js';

import { DEPLOY_ALL_MODULES, DEPLOY_COMMANDS, DEVELOPMENT_GUILD_IDS, PRODUCTION } from '../config';
import { Economica, Event } from '../structures';
import { defaultModulesObj } from '../typings';

export class ReadyEvent implements Event {
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

		client.log.info(`${client.user.tag} Ready`);
	}

	private async updateCommands(client: Economica) {
		const commandData: ApplicationCommandDataResolvable[] = [];
		const defaultCommandData: ApplicationCommandDataResolvable[] = [];
		client.commands.forEach((command) => {
			commandData.push(command.data.toJSON());
			if (defaultModulesObj[command.data.module].type === 'DEFAULT') {
				defaultCommandData.push(command.data.toJSON());
			}
		});

		DEVELOPMENT_GUILD_IDS.forEach(async (id) => {
			const guild = await client.guilds.fetch(id);
			if (DEPLOY_ALL_MODULES) {
				await guild.commands.set(commandData);
			} else await guild.commands.set(defaultCommandData);
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

		await client.application.commands.set([]);
		client.log.debug('Reset global commands');
	}
}
