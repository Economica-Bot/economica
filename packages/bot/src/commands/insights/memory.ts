import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('memory')
		.setDescription('View various bot memory statistics')
		.setModule('INSIGHTS')
		.setFormat('memory')
		.setExamples(['memory']);

	public execution = new Router()
		.get('', async () => {
			const memoryUsage = process.memoryUsage();
			const descriptions: Record<keyof typeof memoryUsage, string> = {
				rss: 'Resident Set Size, the total memory allocated for the process execution.',
				heapTotal: 'The total size of the allocated heap.',
				heapUsed: 'The actual memory used during process execution.',
				external: 'Memory used by C++ objects bound to JS objects managed by V8.',
				arrayBuffers: 'Memory allocated for `ArrayBuffer`s and `SharedArrayBuffer`s.',
			};

			return new ExecutionNode()
				.setName('Bot Memory Levels')
				.setDescription('**View bots usage of memory in various measures.**')
				.setOptions(...Object
					.keys(process.memoryUsage())
					.map((key) => [
						['displayInline', key, `\`${Math.round((memoryUsage[key] / 1024 / 1024) * 100) / 100}Mb\``] as const,
						['displayInline', '‎', `>>> *${descriptions[key]}*`] as const,
						['displayInline', '‎', '‎'] as const,
					])
					.reduce((arr, newarr) => arr.concat(newarr)));
		});
}
