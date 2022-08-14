import { interval } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('fortnightly')
		.setDescription('Earn funds on a fortnightly basis')
		.setModule('INTERVAL')
		.setFormat('fortnightly')
		.setExamples(['fortnightly']);

	public execution = new ExecutionNode()
		.setName('Fortnightly Fund Redeemer')
		.setValue('fortnightly')
		.setDescription((ctx) => ctx.variables.result)
		.setExecution(async (ctx) => { ctx.variables.result = await interval(ctx, 'fortnightly'); });
}
