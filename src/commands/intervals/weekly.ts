import { interval } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('weekly')
		.setDescription('Earn funds on a weekly basis')
		.setModule('INTERVAL')
		.setFormat('weekly')
		.setExamples(['weekly']);

	public execute = new ExecutionBuilder()
		.setExecution(async (ctx) => {
			interval(ctx, 'weekly');
		});
}
