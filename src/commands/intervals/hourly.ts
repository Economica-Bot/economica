import { interval } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('hourly')
		.setDescription('Earn funds on a hourly basis')
		.setModule('INTERVAL')
		.setFormat('hourly')
		.setExamples(['hourly']);

	public execution = new Router()
		.get('', async (ctx) => {
			const result = await interval(ctx, 'hourly');
			return new ExecutionNode()
				.setName('Hourly Fund Redeemer')
				.setDescription(result);
		});
}
