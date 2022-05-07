import { interval } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('hourly')
		.setDescription('Earn funds on an hourly basis')
		.setModule('INTERVAL')
		.setFormat('hourly')
		.setExamples(['hourly']);

	public execute = async (ctx: Context): Promise<void> => interval(ctx, 'hourly');
}
