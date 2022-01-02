import fs from 'fs';
import path from 'path';
import { Collection } from 'discord.js';
import { EconomicaClient, EconomicaService } from '../structures/index';

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
				const command = new (
					await import(`../commands/${commandDirectory}/${commandFile}`)
				).default();

				if (!command.data.group) {
					throw new Error(`Command ${command.name} missing group!`);
				}

				await client.commands.set(command.data.name, command);
				commands.push(command.data.toJSON());
				console.log(`Registered command ${command.data.name}`);
			}
		}

		client.once('ready', async () => {
			await (await client.guilds.fetch(process.env.GUILD_ID)).commands.set(commands);
			//await client.commands.set(commands); //Global
		});

		if (guild_id) {
			await (await client.guilds.fetch(guild_id)).commands.set(commands); //Server
		} else if (global) {
			await client.application.commands.set(commands); //Global
		}

		console.log('Commands registered');
	};
}
