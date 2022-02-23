import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('register-commands')
		.setDescription('Register economica commands')
		.setModule('APPLICATION')
		.setAuthority('DEVELOPER')
		.addSubcommand((subcommand) => subcommand
			.setName('guild')
			.setDescription('Refresh server commands')
			.addStringOption((option) => option.setName('guild_id').setDescription('Specify a server id').setRequired(true)))
		.addSubcommand((subcommand) => subcommand.setName('global').setDescription('Refresh global commands'));

	public execute = async (ctx: Context): Promise<void> => {
		await ctx.interaction.deferReply({ ephemeral: true });
		const guildId = ctx.interaction.options.getString('guild_id');
		// const global = ctx.interaction.options.getSubcommand() === 'global' ? true : false;
		if (!(await ctx.client.guilds.fetch()).has(guildId)) {
			await ctx.embedify('error', 'user', 'Could not find guild with that id.', true);
		} else {
			await ctx.client.registerCommands();
			await ctx.embedify('error', 'bot', 'Commands refreshed.', true);
		}
	};
}
