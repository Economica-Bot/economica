import { EmbedBuilder } from 'discord.js';

import { Economica, Event } from '../structures';

export class WarnEvent implements Event {
	public event = 'warn' as const;
	public async execute(client: Economica, error: Error): Promise<void> {
		client.webhooks.forEach(async (webhook) => {
			const description = `\`\`\`ts\n${error}\`\`\``;
			const embed = new EmbedBuilder().setAuthor({ name: 'Discord Websocket Warning' }).setDescription(description);
			await webhook.send({ embeds: [embed] });
		});
	}
}
