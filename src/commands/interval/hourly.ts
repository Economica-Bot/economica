import { interval } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('hourly')
		.setDescription('Earn funds on an hourly basis.')
		.setModule('INTERVAL')
		.setGlobal(false);

	public execute = async (ctx: Context): Promise<void> => {
		return await interval(ctx, 'hourly');
	};
}
