import { interval } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('monthly')
		.setDescription('Earn funds on a monthly basis.')
		.setModule('INTERVAL')
		.setGlobal(false);

	public execute = async (ctx: Context): Promise<void> => {
		return await interval(ctx, 'monthly');
	};
}
