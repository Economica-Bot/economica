import { interval } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('monthly')
		.setDescription('Earn funds on a monthly basis')
		.setModule('INTERVAL')
		.setFormat('monthly')
		.setExamples(['monthly']);

	public execute = new ExecutionBuilder().setExecution(async (ctx) => {
		interval(ctx, 'monthly');
	});
}
