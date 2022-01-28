import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('reset')
		.setDescription('Reset all slash commands')
		.setGroup('APPLICATION')
		.setAuthority('DEVELOPER');

	execute = async (ctx: Context) => {
		await ctx.interaction.deferReply({ ephemeral: true });
		await ctx.interaction.guild.commands.set([]);
		await ctx.client.application.commands.set([]);
		return await ctx.embedify('success', 'bot', '`Reset all slash commands.`');
	};
}
