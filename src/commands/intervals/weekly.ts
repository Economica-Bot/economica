import { interval } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('weekly')
		.setDescription('Earn funds on a weekly basis')
		.setModule('INTERVAL')
		.setFormat('weekly')
		.setExamples(['weekly']);

	public execution = new ExecutionNode()
		.setName('Weekly Fund Redeemer')
		.setValue('weekly')
		.setDescription((ctx) => ctx.variables.result)
		.setExecution(async (ctx) => { ctx.variables.result = await interval(ctx, 'weekly'); });
}
