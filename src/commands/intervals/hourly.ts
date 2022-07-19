import { interval } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('hourly')
		.setDescription('Earn funds on a hourly basis')
		.setModule('INTERVAL')
		.setFormat('hourly')
		.setExamples(['hourly']);

	public execute = new ExecutionBuilder()
		.setExecution(async (ctx) => {
			interval(ctx, 'hourly');
		});
}
