import { Emojis } from '@economica/common';
import { EmbedBuilder, parseEmoji } from 'discord.js';
import { Command } from '../structures/commands';

export const Memory = {
	identifier: /^memory$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const description =
			'**View bots usage of memory in various measures.**\n\n' +
			'**rss**: Resident Set Size, the total memory allocated for the process execution\n' +
			'**heapTotal**: The total size of the allocated heap.\n' +
			'**heapUsed**: The actual memory used during process execution.\n' +
			'**external**: Memory used by C++ objects bound to JS objects managed by V8.\n' +
			'**arrayBuffers**: Memory allocated for `ArrayBuffer`s and `SharedArrayBuffer`s.';
		const embed = new EmbedBuilder().setDescription(description).setAuthor({
			name: 'Bot Memory Levels',
			iconURL: interaction.client.emojis.resolve(parseEmoji(Emojis.RAM)!.id!)!
				.url
		});
		Object.entries(process.memoryUsage()).forEach((key, value) =>
			embed.addFields([
				{
					name: key[0],
					value: `\`${Math.round((value / 1024 / 1024) * 100) / 100}Mb\``,
					inline: true
				}
			])
		);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
