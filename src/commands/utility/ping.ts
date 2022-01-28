import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import i18n from '../../config';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('ping')
		.setDescription("Get Economica's latency.")
		.setGroup('utility')
		.setGlobal(true);

	execute = async (ctx: Context) => {
		return await ctx.embedify(
			'success',
			'user',
			i18n.__mf('commands.utility.ping.description', { ping: ctx.client.ws.ping })
		);
	};
}
