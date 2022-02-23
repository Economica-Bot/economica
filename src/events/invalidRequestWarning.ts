import { MessageEmbed } from 'discord.js';

import { Economica, Event } from '../structures/index.js';

export default class implements Event {
	public event = 'invalidRequestWarning' as const;
	public async execute(client: Economica, error: Error): Promise<void> {
		client.webhooks.forEach(async (webhook) => {
			const description = `\`\`\`ts\n${error}\`\`\``;
			const embed = new MessageEmbed()
				.setAuthor({ name: 'Discord Invalid Request Warning' })
				.setDescription(description);
			await webhook.send({ embeds: [embed] });
		});
	}
}
