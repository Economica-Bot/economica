import { Util } from 'discord.js';

import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures';
import { emojis } from '../../typings';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('memory')
		.setDescription('View various bot memory statistics')
		.setModule('INSIGHTS')
		.setFormat('memory')
		.setExamples(['memory']);

	public execute = async (ctx: Context) => {
		const description = '**View bots usage of memory in various measures.**\n\n'
		+ '**rss**: Resident Set Size, the total memory allocated for the process execution\n'
		+ '**heapTotal**: The total size of the allocated heap.\n'
		+ '**heapUsed**: The actual memory used during process execution.\n'
		+ '**external**: Memory used by C++ objects bound to JS objects managed by V8.\n'
		+ '**arrayBuffers**: Memory allocated for `ArrayBuffer`s and `SharedArrayBuffer`s.';
		const embed = ctx
			.embedify('info', 'bot', description)
			.setAuthor({ name: 'Bot Memory Levels', iconURL: ctx.client.emojis.resolve(Util.parseEmoji(emojis.MEMORY).id).url });
		Object.entries(process.memoryUsage()).forEach((key, value) => embed.addField(key[0], `\`${value / 1024 / 1024}Mb\``, true));
		await ctx.interaction.reply({ embeds: [embed] });
	};
}
