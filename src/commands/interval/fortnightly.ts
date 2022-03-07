import { interval } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('fortnightly')
		.setDescription('Earn funds on a fortnightly basis')
		.setModule('INTERVAL')
		.setFormat('fortnightly')
		.setExamples(['fortnightly'])
		.setGlobal(false);

	public execute = async (ctx: Context): Promise<void> => interval(ctx, 'fortnightly');
}
