import { interval } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('daily')
		.setDescription('Earn funds on a daily basis')
		.setModule('INTERVAL')
		.setFormat('daily')
		.setExamples(['daily']);

	public execution = new Router()
		.get('', async (ctx) => {
			const result = await interval(ctx, 'daily');
			return new ExecutionNode()
				.setName('Daily Fund Redeemer')
				.setDescription(result);
		});
}
