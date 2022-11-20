import { Client } from 'discord.js';
import * as Commands from './commands';
import { env } from './env.mjs';
import { resetCommands, updateCommands } from './lib/commands';

console.log(process.version);

export const client = new Client({
	intents: ['Guilds', 'GuildMessages']
});
await client.login(env.DISCORD_BOT_TOKEN);

console.log('Registering commands');
if (env.DEPLOY_COMMANDS === 'nothing') {
	console.log('Commands Idle');
} else if (env.DEPLOY_COMMANDS === 'update') {
	await updateCommands(client);
} else if (env.DEPLOY_COMMANDS === 'reset') {
	await resetCommands(client);
	await updateCommands(client);
}

client.on('interactionCreate', async (interaction) => {
	console.log('Interaction received');
	if (!interaction.inCachedGuild()) return;
	try {
		if (interaction.isChatInputCommand()) {
			const command = Object.values(Commands)
				.filter((command) => command.type === 'chatInput')
				.find((command) => {
					console.log(command.identifier.exec(interaction.commandName));
					return command.identifier.test(interaction.commandName);
				});

			if (command) await command.execute(interaction as any);
			else await interaction.reply('Unknown interaction');
		} else if (interaction.isSelectMenu()) {
			const command = Object.values(Commands)
				.filter((command) => command.type === 'selectMenu')
				.find((command) => {
					console.log(command.identifier.exec(interaction.values.at(0)!));
					return command.identifier.test(interaction.values.at(0)!);
				});

			if (command) await command.execute(interaction as any);
			else await interaction.reply('Unknown interaction');
		}
	} catch (err) {
		console.log('Error caught');
		console.error(err);
		if (err instanceof Error) {
			if (interaction.isRepliable()) interaction.reply(err.toString());
		} else {
			if (interaction.isRepliable()) interaction.reply('Unknown error :(');
		}
	}
});

async function unhandledRejection(err: Error): Promise<void> {
	if (env.NODE_ENV === 'development') {
		console.error(err);
		process.exit(1);
	} else {
		console.error(err);
	}
}

async function uncaughtException(err: Error) {
	console.error(err);
	if (env.NODE_ENV === 'development') process.exit(1);
}

process.on('unhandledRejection', (err: Error) => unhandledRejection(err));
process.on('uncaughtException', (err) => uncaughtException(err));
