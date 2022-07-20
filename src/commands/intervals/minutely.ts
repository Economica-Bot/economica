import { interval } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('minutely')
		.setDescription('Earn funds on a minutely basis')
		.setModule('INTERVAL')
		.setFormat('minutely')
		.setExamples(['minutely']);

	public execute = new ExecutionBuilder().setExecution(async (ctx) => {
		interval(ctx, 'minutely');
	});
}
