import { Client } from 'discord.js';

import { env } from './env.mjs';
import { resetCommands, updateCommands } from './lib/commands';

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

client.on('interactionCreate', (interaction) => {
	if (interaction.isChatInputCommand()) {
		interaction.reply('Hello World!');
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
