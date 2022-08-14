import { interval } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('minutely')
		.setDescription('Earn funds on a minutely basis')
		.setModule('INTERVAL')
		.setFormat('minutely')
		.setExamples(['minutely']);

	public execution = new ExecutionNode()
		.setName('Minutely Fund Redeemer')
		.setValue('minutely')
		.setDescription((ctx) => ctx.variables.result)
		.setExecution(async (ctx) => { ctx.variables.result = await interval(ctx, 'minutely'); });
}
