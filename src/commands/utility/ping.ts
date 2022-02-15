import { i18n } from '../../config';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('ping')
		.setDescription("Get Economica's latency.")
		.setModule('UTILITY')
		.setGlobal(true);

	public execute = async (ctx: Context): Promise<void> => {
		return await ctx.embedify(
			'success',
			'user',
			i18n.__mf('commands.utility.ping.description', { ping: ctx.client.ws.ping }),
			false
		);
	};
}
