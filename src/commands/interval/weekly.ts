import { interval } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('weekly')
		.setDescription('Earn funds on a weekly basis.')
		.setModule('INTERVAL')
		.setFormat('weekly')
		.setExamples(['weekly']);

	public execute = async (ctx: Context): Promise<void> => interval(ctx, 'weekly');
}
