import { interval } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('daily')
		.setDescription('Earn funds on a daily basis')
		.setModule('INTERVAL')
		.setFormat('daily')
		.setExamples(['daily'])
		.setGlobal(false);

	public execute = async (ctx: Context): Promise<void> => interval(ctx, 'daily');
}
