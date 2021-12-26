import EconomicaClient from '../structures/EconomicaClient';
import EconomicaCommand from '../structures/EconomicaCommand';

const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

export const name = 'commands';

export async function execute(client: EconomicaClient) {
	client.commands = new Collection();

	const commandDirectories = fs.readdirSync(
		path.join(__dirname, '../commands')
	);

	for (const commandDirectory of commandDirectories) {
		const commandFiles = fs.readdirSync(
			path.join(__dirname, `../commands/${commandDirectory}/`)
		);

		for (const commandFile of commandFiles) {
			const command = require(path.join(
				__dirname,
				`../commands/${commandDirectory}/${commandFile}`
			)) as EconomicaCommand;

			console.log(command)

			await client.commands.set(command.data.name, command);
		}
	}

	//await client.commands.set(commands); //Global

	// await (
	//   await client.guilds.fetch(process.env.GUILD_ID)
	// ).commands.set(commands);

	console.log('Commands registered');
}
