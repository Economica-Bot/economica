import { interval } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('daily')
		.setDescription('Earn funds on a daily basis')
		.setModule('INTERVAL')
		.setFormat('daily')
		.setExamples(['daily']);

	public execute = new ExecutionBuilder()
		.setExecution(async (ctx) => {
			interval(ctx, 'daily');
		});
}
