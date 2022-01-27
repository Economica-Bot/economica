import { Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { DEVELOPMENT_GUILD } from '../config';

import { EconomicaClient, EconomicaService } from '../structures';

export default class implements EconomicaService {
	name = 'register-commands';
	execute = async (client: EconomicaClient, guild_id?: string, global?: boolean) => {
		console.log(`Executing service ${this.name}`);
		client.commands = new Collection();
		const commands = new Array();
		const commandDirectories = fs.readdirSync(path.join(__dirname, '../commands'));

		for (const commandDirectory of commandDirectories) {
			const commandFiles = fs
				.readdirSync(path.join(__dirname, `../commands/${commandDirectory}/`))
				.filter((f: string) => f.endsWith('ts'));

			for (const commandFile of commandFiles) {
				const command = new (await import(`../commands/${commandDirectory}/${commandFile}`)).default();

				if (!command.data.group) {
					throw new Error(`Command ${command.data.name} missing group!`);
				}

				await client.commands.set(command.data.name, command);
				commands.push(command.data.toJSON());
				console.log(`Registered command ${command.data.name}`);
			}
		}

		client.once('ready', async () => {
			DEVELOPMENT_GUILD.forEach(async (guildId) => {
				const guild = await client.guilds.fetch(guildId);
				await guild.commands.set(commands);
			});
			//await client.commands.set(commands); //Global
		});

		if (guild_id) {
			const guild = await client.guilds.fetch(guild_id);
			await guild.commands.set(commands); //Server
		} else if (global) {
			await client.application.commands.set(commands); //Global
		}

		console.log('Commands registered');
	};
}
