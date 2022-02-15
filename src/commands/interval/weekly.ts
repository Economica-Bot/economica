import { interval } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('weekly')
		.setDescription('Earn funds on a weekly basis.')
		.setModule('INTERVAL')
		.setGlobal(false);

	public execute = async (ctx: Context): Promise<void> => {
		return await interval(ctx, 'weekly');
	};
}
