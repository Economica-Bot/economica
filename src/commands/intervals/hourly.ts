import { interval } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('hourly')
		.setDescription('Earn funds on a hourly basis')
		.setModule('INTERVAL')
		.setFormat('hourly')
		.setExamples(['hourly']);

	public execution = new ExecutionNode()
		.setName('Hourly Fund Redeemer')
		.setValue('hourly')
		.setDescription((ctx) => ctx.variables.result)
		.setExecution(async (ctx) => { ctx.variables.result = await interval(ctx, 'hourly'); });
}
