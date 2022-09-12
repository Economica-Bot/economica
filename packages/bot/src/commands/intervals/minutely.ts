import { interval } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('minutely')
		.setDescription('Earn funds on a minutely basis')
		.setModule('INTERVAL')
		.setFormat('minutely')
		.setExamples(['minutely']);

	public execution = new Router()
		.get('', async (ctx) => {
			const result = await interval(ctx, 'minutely');
			return new ExecutionNode()
				.setName('Minutely Fund Redeemer')
				.setDescription(result);
		});
}
