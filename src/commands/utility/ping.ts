import i18n from '../../config';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('ping')
		.setDescription("Get Economica's latency.")
		.setGroup('UTILITY')
		.setGlobal(true);

	execute = async (ctx: Context) => {
		return await ctx.embedify(
			'success',
			'user',
			i18n.__mf('commands.utility.ping.description', { ping: ctx.client.ws.ping })
		);
	};
}
