import { interval } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('monthly')
		.setDescription('Earn funds on a monthly basis')
		.setModule('INTERVAL')
		.setFormat('monthly')
		.setExamples(['monthly']);

	public execution = new ExecutionNode()
		.setName('Monthly Fund Redeemer')
		.setValue('monthly')
		.setDescription((ctx) => ctx.variables.result)
		.setExecution(async (ctx) => { ctx.variables.result = await interval(ctx, 'monthly'); });
}
