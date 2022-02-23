import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('reset')
		.setDescription('Reset all slash commands')
		.setModule('APPLICATION')
		.setAuthority('DEVELOPER');

	public execute = async (ctx: Context): Promise<void> => {
		await ctx.interaction.deferReply({ ephemeral: true });
		await ctx.interaction.guild.commands.set([]);
		await ctx.client.application.commands.set([]);
		await ctx.embedify('success', 'bot', '`Reset all slash commands.`', true);
	};
}
