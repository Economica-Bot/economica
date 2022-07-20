import { interval } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('fortnightly')
		.setDescription('Earn funds on a fortnightly basis')
		.setModule('INTERVAL')
		.setFormat('fortnightly')
		.setExamples(['fortnightly']);

	public execute = new ExecutionBuilder().setExecution(async (ctx) => {
		interval(ctx, 'fortnightly');
	});
}
