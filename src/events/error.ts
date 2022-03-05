import { MessageEmbed } from 'discord.js';

import { Economica, Event } from '../structures';

export default class implements Event {
	public event = 'error' as const;
	public async execute(client: Economica, error: Error): Promise<void> {
		client.webhooks.forEach((webhook) => {
			const description = `\`\`\`ts\n${error}\`\`\``;
			const embed = new MessageEmbed().setAuthor({ name: 'Discord Websocket Error' }).setDescription(description);
			webhook.send({ embeds: [embed] });
		});
	}
}
