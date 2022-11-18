import {
	CommandData,
	DefaultModulesObj,
	ModuleString
} from '@economica/common';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Client } from 'discord.js';
import { env } from '../env.mjs';

export const updateCommands = async (client: Client<true>) => {
	const defaultCommandData: RESTPostAPIApplicationCommandsJSONBody[] = [];
	const specialCommandData: RESTPostAPIApplicationCommandsJSONBody[] = [];
	CommandData.forEach((metadata) => {
		if (DefaultModulesObj[metadata.module as ModuleString].type === 'DEFAULT') {
			defaultCommandData.push(metadata);
		} else {
			specialCommandData.push(metadata);
		}
	});

	env.DEV_GUILD_IDS.forEach(async (id) => {
		if (env.DEPLOY_ALL_MODULES)
			await client.guilds.cache.get(id)?.commands.set(specialCommandData);
		console.log(`Registered special commands in dev guild ${id}`);
	});

	await client.application.commands.set(defaultCommandData);
	console.log('Registered global commands');
};

export const resetCommands = async (client: Client) => {
	env.DEV_GUILD_IDS.forEach(async (id) => {
		await client.guilds.cache.get(id)?.commands.set([]);
		console.log(`Reset commands in dev guild ${id}`);
	});

	await client.application?.commands.set([]);
	console.log('Reset global commands');
};
