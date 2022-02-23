import { interval } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('minutely')
		.setDescription('Earn funds on a minutely basis')
		.setModule('INTERVAL')
		.setFormat('minutely')
		.setExamples(['minutely'])
		.setGlobal(false);

	public execute = async (ctx: Context): Promise<void> => interval(ctx, 'INTERVAL_MINUTE');
}
