import { Message } from 'discord.js';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('register-commands')
		.setDescription('Register economica commands.')
		.setModule('APPLICATION')
		.setAuthority('DEVELOPER')
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('guild')
				.setDescription('Refresh server commands.')
				.addStringOption((option) => option.setName('guild_id').setDescription('Specify a server id').setRequired(true))
		)
		.addEconomicaSubcommand((subcommand) => subcommand.setName('global').setDescription('Refresh global commands.'));

	public execute = async (ctx: Context): Promise<Message> => {
		await ctx.interaction.deferReply({ ephemeral: true });
		const guildId = ctx.interaction.options.getString('guild_id');
		const global = ctx.interaction.options.getSubcommand() === 'global' ? true : false;
		if (!(await ctx.client.guilds.fetch()).has(guildId)) {
			return await ctx.embedify('error', 'user', 'Could not find guild with that id.', true);
		}

		await ctx.client.registerCommands();
		return await ctx.embedify('error', 'bot', 'Commands refreshed.', true);
	};
}
