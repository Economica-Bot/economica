import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures/index';
import * as util from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('ping')
		.setDescription("Get Economica's latency.")
		.setGroup('utility')
		.setGlobal(true);

	execute = async (ctx: Context) => {
		await ctx.interaction.reply({
			embeds: [
				util.embedify(
					'GREEN',
					ctx.interaction.user.tag,
					ctx.interaction.user.displayAvatarURL(),
					`Pong! \`${ctx.client.ws.ping}ms\``
				),
			],
		});
	};
}
