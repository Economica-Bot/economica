import { interval } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('monthly')
		.setDescription('Earn funds on a monthly basis')
		.setModule('INTERVAL')
		.setFormat('monthly')
		.setExamples(['monthly'])
		.setAuthority('USER')
		.setDefaultPermission(false);

	public execute = async (ctx: Context): Promise<void> => interval(ctx, 'monthly');
}
