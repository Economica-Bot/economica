import { interval } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('daily')
		.setDescription('Earn funds on a daily basis')
		.setModule('INTERVAL')
		.setFormat('daily')
		.setExamples(['daily']);

	public execution = new ExecutionNode()
		.setName('Daily Fund Redeemer')
		.setValue('daily')
		.setDescription((ctx) => ctx.variables.result)
		.setExecution(async (ctx) => { ctx.variables.result = await interval(ctx, 'daily'); });
}
