import { interval } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('weekly')
		.setDescription('Earn funds on a weekly basis')
		.setModule('INTERVAL')
		.setFormat('weekly')
		.setExamples(['weekly']);

	public execution = new Router()
		.get('', async (ctx) => {
			const result = await interval(ctx, 'weekly');
			return new ExecutionNode()
				.setName('Weekly Fund Redeemer')
				.setDescription(result);
		});
}
