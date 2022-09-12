import { interval } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('monthly')
		.setDescription('Earn funds on a monthly basis')
		.setModule('INTERVAL')
		.setFormat('monthly')
		.setExamples(['monthly']);

	public execution = new Router()
		.get('', async (ctx) => {
			const result = await interval(ctx, 'monthly');
			return new ExecutionNode()
				.setName('Monthly Fund Redeemer')
				.setDescription(result);
		});
}
