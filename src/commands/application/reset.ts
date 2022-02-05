import { Message } from 'discord.js';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('reset')
		.setDescription('Reset all slash commands')
		.setModule('APPLICATION')
		.setAuthority('DEVELOPER');

	public execute = async (ctx: Context): Promise<Message> => {
		await ctx.interaction.deferReply({ ephemeral: true });
		await ctx.interaction.guild.commands.set([]);
		await ctx.client.application.commands.set([]);
		return await ctx.embedify('success', 'bot', '`Reset all slash commands.`', true);
	};
}
