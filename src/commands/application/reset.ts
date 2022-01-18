import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures/index';
import { embedify } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('reset')
		.setDescription('Reset all slash commands')
		.setGroup('application')
		.setDevOnly(true);
	execute = async (ctx: Context) => {
		await ctx.interaction.deferReply({ ephemeral: true });
		await ctx.interaction.guild.commands.set([]);
		await ctx.client.application.commands.set([]);
		await ctx.interaction.editReply({
			embeds: [
				embedify(
					'GREEN',
					ctx.interaction.user.username,
					ctx.interaction.user.avatarURL(),
					'`RESET ALL SLASH COMMANDS`'
				),
			],
		});
	};
}
