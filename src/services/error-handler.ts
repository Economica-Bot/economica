import { MessageEmbed } from 'discord.js';

import { DEBUG, DEVELOPMENT } from '../config';
import { EconomicaClient, EconomicaService } from '../structures';

export default class implements EconomicaService {
	name = 'error-handler';

	execute = async (client: EconomicaClient) => {
		console.log(`Executing service ${this.name}`);

		process.on('unhandledRejection', async (err: Error) => await this.unhandledRejection(client, err));
		process.on('uncaughtException', async (err, origin) => await this.uncaughtException(client, err, origin));
	};

	unhandledRejection = async (client: EconomicaClient, err: Error) => {
		if (DEBUG) console.error(err);
		const description = '```ts\n' + err.stack + '```';
		const embed = new MessageEmbed()
			.setColor('DARK_ORANGE')
			.setAuthor({ name: 'Unhandled Rejection' })
			.setDescription(description)
			.setTimestamp();
		client.webhooks.forEach((webhook) => webhook.send({ embeds: [embed] }));
	};

	uncaughtException = async (client: EconomicaClient, err: Error, origin: string) => {
		console.error(err);
		const embed = new MessageEmbed()
			.setColor('RED')
			.setAuthor({ name: 'CRITICAL | Uncaught Exception' })
			.setDescription(`Caught exception: ${err}\nException origin: ${origin}`)
			.setTimestamp();
		client.webhooks.forEach((webhook) => webhook.send({ embeds: [embed] }).catch);
		if (DEVELOPMENT) process.exit(1);
	};
}
