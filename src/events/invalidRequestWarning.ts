import { MessageEmbed } from 'discord.js';

import { EconomicaClient } from '../structures';

export const name = 'invalidRequestWarning';

export async function execute(client: EconomicaClient, error: Error) {
	client.webhooks.forEach((webhook) => {
		const description = '```ts\n' + error + '```';
		const embed = new MessageEmbed().setAuthor({ name: 'Discord Invalid Request Warning' }).setDescription(description);
		webhook.send({ embeds: [embed] });
	});
}
