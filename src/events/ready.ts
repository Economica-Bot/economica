import { DEVELOPMENT_GUILD_IDS, PRODUCTION } from '../config';
import { EconomicaClient } from '../structures';

export const name = 'ready';

export async function execute(client: EconomicaClient) {
	const commandData: any[] = [];
	client.commands.forEach((command) => {
		commandData.push(command.data.toJSON());
	});

	DEVELOPMENT_GUILD_IDS.forEach(async (guildId) => {
		const guild = await client.guilds.fetch(guildId);
		await guild.commands.set(commandData);
	});

	if (PRODUCTION) {
		await client.application.commands.set(commandData);
	}

	console.log('Commands registered');
	console.log(`${client.user.tag} Ready`);
}
