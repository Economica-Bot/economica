const mongo = require('../util/mongo/mongo');
const commands = require('../config/commands');
const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
	name: 'ready',
	async run() {
		await registerCommands();

		await mongo().then(() => {
			console.log('Connected to DB');
		});

		const checkMutes = require(path.join(
			__dirname,
			'../util/features/check-mute'
		));
		await checkMutes(client);
		const checkLoans = require(path.join(
			__dirname,
			'../util/features/check-loan'
		));
		await checkLoans(client);
		const checkActive = require(path.join(
			__dirname,
			'../util/features/shop-item-handler'
		));
		await checkActive();
		const generate = require(path.join(
			__dirname,
			'../util/features/generator'
		));
		await generate();

		console.log(`${client.user.tag} Ready`);
	},
};

const registerCommands = async () => {
	console.log('Registering commands...');

	client.cmds = new Collection();

	console.log(commandDirectories);

	for (const commandDirectory of commandDirectories) {
		const commandFiles = fs
			.readdirSync(path.join(__dirname, `commands/${commandDirectory}/`))
			.filter((file) => file.endsWith('js'));
		for (const commandFile of commandFiles) {
			const commandExecute = require(path.join(
				__dirname,
				`/commands/${commandDirectory}/${commandFile}`
			));
			const commandSettings = commands.commands.find(
				(command) => command.name === commandFile
			);
			const command = (commandSettings.run = commandExecute.run);
			console.log(command);
			//client.commands.set(command.name, command);
		}
	}

	//await client.commands.set(commands); //Global

	// await (
	//   await client.guilds.fetch(process.env.GUILD_ID)
	// ).commands.set(commands);

	console.log('Commands registered');
};
