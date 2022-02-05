import { MessageEmbed } from 'discord.js';

import { EconomicaClient, EconomicaEvent } from '../structures';

export default class implements EconomicaEvent {
	public name = 'warn' as const;
	public async execute(client: EconomicaClient, error: Error): Promise<void> {
		client.webhooks.forEach(async (webhook) => {
			const description = '```ts\n' + error + '```';
			const embed = new MessageEmbed().setAuthor({ name: 'Discord Websocket Warning' }).setDescription(description);
			await webhook.send({ embeds: [embed] });
		});
	}
}
