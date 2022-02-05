import { MessageEmbed } from 'discord.js';

import { EconomicaClient, EconomicaEvent } from '../structures';

export default class implements EconomicaEvent {
	public name = 'error' as const;
	public async execute(client: EconomicaClient, error: Error): Promise<void> {
		client.webhooks.forEach((webhook) => {
			const description = '```ts\n' + error + '```';
			const embed = new MessageEmbed().setAuthor({ name: 'Discord Websocket Error' }).setDescription(description);
			webhook.send({ embeds: [embed] });
		});
	}
}
