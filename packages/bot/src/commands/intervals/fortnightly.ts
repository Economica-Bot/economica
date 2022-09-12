import { interval } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('fortnightly')
		.setDescription('Earn funds on a fortnightly basis')
		.setModule('INTERVAL')
		.setFormat('fortnightly')
		.setExamples(['fortnightly']);

	public execution = new Router()
		.get('', async (ctx) => {
			const result = await interval(ctx, 'fortnightly');
			return new ExecutionNode()
				.setName('Fortnightly Fund Redeemer')
				.setDescription(result);
		});
}
