import { codeBlock, EmbedBuilder } from 'discord.js';

import { Economica, Event } from '../structures';

export default class implements Event<'error'> {
	public event = 'error' as const;

	public async execute(client: Economica, error: Error) {
		client.log.error(error);
		client.webhooks.forEach(async (webhook) => {
			const description = codeBlock('js', error.toString());
			const embed = new EmbedBuilder().setAuthor({ name: 'Discord Error' }).setDescription(description);
			await webhook.send({ embeds: [embed] });
		});
	}
}
