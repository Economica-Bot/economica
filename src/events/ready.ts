import { DEVELOPMENT_GUILD_IDS, PRODUCTION } from '../config';
import { EconomicaClient, EconomicaEvent } from '../structures';

export default class implements EconomicaEvent {
	public name = 'ready' as const;
	public async execute(client: EconomicaClient) {
		const commandData: any[] = [];
		client.commands.forEach((command) => {
			commandData.push(command.data.toJSON());
		});

		for (const DEVELOPMENT_GUILD_ID of DEVELOPMENT_GUILD_IDS) {
			const guild = await client.guilds.fetch(DEVELOPMENT_GUILD_ID);
			await guild.commands.set(commandData);
			client.log.debug(`Registered commands in dev guild ${guild.name}`);
		}

		if (PRODUCTION) {
			await client.application.commands.set(commandData);
			client.log.debug('Registered global commands');
		}

		client.log.info('Commands registered');
		client.log.info(`${client.user.tag} Ready`);
	}
}
