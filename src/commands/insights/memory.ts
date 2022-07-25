import { parseEmoji } from 'discord.js';

import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('memory')
		.setDescription('View various bot memory statistics')
		.setModule('INSIGHTS')
		.setFormat('memory')
		.setExamples(['memory']);

	public execute = new ExecutionBuilder().setExecution(async (ctx) => {
		const memoryUsage = process.memoryUsage();
		const descriptions: Record<keyof typeof memoryUsage, string> = {
			rss: 'Resident Set Size, the total memory allocated for the process execution.',
			heapTotal: 'The total size of the allocated heap.',
			heapUsed: 'The actual memory used during process execution.',
			external: 'Memory used by C++ objects bound to JS objects managed by V8.',
			arrayBuffers: 'Memory allocated for `ArrayBuffer`s and `SharedArrayBuffer`s.',
		};

		await ctx
			.embedify('info', 'bot', '**View bots usage of memory in various measures.**')
			.setAuthor({ name: 'Bot Memory Levels', iconURL: ctx.client.emojis.resolve(parseEmoji(Emojis.RAM).id)?.url })
			.addFields(
				Object.keys(process.memoryUsage())
					.map((key) => [
						{
							name: `${key}`,
							value: `\`${Math.round((memoryUsage[key] / 1024 / 1024) * 100) / 100}Mb\``,
							inline: true,
						},
						{ name: '‎', value: `>>> *${descriptions[key]}*`, inline: true },
						{ name: '‎', value: '‎', inline: true },
					])
					.reduce((arr, newarr) => arr.concat(newarr)),
			)
			.send();
	});
}
