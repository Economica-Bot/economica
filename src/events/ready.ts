import { DEVELOPMENT_GUILD_IDS, PRODUCTION } from '../config';
import { EconomicaClient, EconomicaEvent } from '../structures';

export default class implements EconomicaEvent {
	public name = 'ready' as const;
	public async execute(client: EconomicaClient) {
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

		client.log.info('Commands registered');
		client.log.info(`${client.user.tag} Ready`);
	}
}
