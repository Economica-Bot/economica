import { codeBlock, EmbedBuilder } from 'discord.js';

import { Economica, Event } from '../structures';

export default class implements Event<'warn'> {
	public event = 'warn' as const;

	public async execute(client: Economica, message: string): Promise<void> {
		client.webhooks.forEach(async (webhook) => {
			const description = codeBlock('js', message.toString());
			const embed = new EmbedBuilder().setAuthor({ name: 'Discord Websocket Warning' }).setDescription(description);
			await webhook.send({ embeds: [embed] });
		});
	}
}
