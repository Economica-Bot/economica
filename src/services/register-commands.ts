const { Collection } = require('discord.js');
const path = require('path');
import fs from 'fs';
import {
	EconomicaSlashCommandBuilder,
	EconomicaClient,
	EconomicaCommand,
} from '../structures/index';

export const name = 'commands';

export async function execute(client: EconomicaClient) {
	client.commands = new Collection();
	const commands = new Array();
	const commandDirectories = fs.readdirSync(path.join(__dirname, '../commands'));

	for (const commandDirectory of commandDirectories) {
		const commandFiles = fs
			.readdirSync(path.join(__dirname, `../commands/${commandDirectory}/`))
			.filter((f: string) => f.endsWith('ts'));

		for (const commandFile of commandFiles) {
			const command = await import(`../commands/${commandDirectory}/${commandFile}`);
			const test = new command.default() as EconomicaCommand;
			const data = test.data as EconomicaSlashCommandBuilder;
			await client.commands.set(data.name, test);
			commands.push(data.toJSON());
			console.log(`Registered command ${data.name}...`);
		}
	}

	client.once('ready', async () => {
		await (await client.guilds.fetch(process.env.GUILD_ID)).commands.set(commands);
		//await client.commands.set(commands); //Global
	});
	console.log('Commands registered');
}
