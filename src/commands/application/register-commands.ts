import registerCommands from '../../services/register-commands';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('register-commands')
		.setDescription('Register economica commands.')
		.setGroup('application')
		.setDevOnly(true)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('guild')
				.setDescription('Refresh server commands.')
				.addStringOption((option) =>
					option.setName('guild_id').setDescription('Specify a server id').setRequired(true)
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('global').setDescription('Refresh global commands.')
		);

	execute = async (ctx: Context) => {
		await ctx.interaction.deferReply({ ephemeral: true });
		const guild_id = ctx.interaction.options.getString('guild_id');
		const global = ctx.interaction.options.getSubcommand() === 'global' ? true : false;
		if (!(await ctx.client.guilds.fetch()).has(guild_id)) {
			return await ctx.interaction.editReply(`Could not find guild with ID \`${guild_id}\``);
		}

		await new registerCommands().execute(ctx.client, guild_id, global);
		return await ctx.interaction.editReply('Commands refreshed.');
	};
}
