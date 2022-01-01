import fs from 'fs';
import path from 'path';
import { Collection } from 'discord.js';
import { EconomicaClient, EconomicaCommand, EconomicaService } from '../structures/index';

export default class implements EconomicaService {
	name = 'register-commands';
	execute = async (client: EconomicaClient) => {
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
				await client.commands.set(command.data.name, command);
				commands.push(command.data.toJSON());
				console.log(`Registered command ${command.data.name}`);
			}
		}

		client.once('ready', async () => {
			await (await client.guilds.fetch(process.env.GUILD_ID)).commands.set(commands);
			//await client.commands.set(commands); //Global
		});
		console.log('Commands registered');
	};
}
