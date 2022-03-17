import { EmbedBuilder } from 'discord.js';

import { Economica, Event } from '../structures/index.js';

export default class implements Event {
	public event = 'error' as const;
	public async execute(client: Economica, error: Error): Promise<void> {
		client.webhooks.forEach(async (webhook) => {
			const description = `\`\`\`ts\n${error}\`\`\``;
			const embed = new EmbedBuilder().setAuthor({ name: 'Discord Error' }).setDescription(description);
			await webhook.send({ embeds: [embed] });
		});
	}
}
