import { ChannelType, PermissionFlagsBits } from 'discord.js';

import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('purge')
		.setDescription('Delete messages in a channel')
		.setModule('UTILITY')
		.setFormat('purge [channel] [amount]')
		.setExamples(['purge', 'purge #general', 'purge #general 50'])
		.setClientPermissions(['ManageMessages'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addChannelOption((option) => option
			.setName('channel')
			.setDescription('Specify a channel')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(false))
		.addIntegerOption((option) => option
			.setName('amount')
			.setDescription('Specify an amount.')
			.setMinValue(1)
			.setMaxValue(100)
			.setRequired(false));

	public execute = new ExecutionBuilder()
		.setExecution(async (ctx) => {
			const channel = (ctx.interaction.options.getChannel('channel') ?? ctx.interaction.channel);
			if (!channel.permissionsFor(ctx.interaction.guild.members.me).has('ManageMessages')) {
				await ctx.embedify('error', 'bot', 'I need `MANAGE_MESSAGES` in that channel.').send(true);
				return;
			}

			if (channel.type !== ChannelType.GuildText) {
				await ctx.embedify('error', 'bot', 'That is not a text based channel!').send(true);
				return;
			}

			const amount = ctx.interaction.options.getInteger('amount') ?? 100;
			await ctx.embedify('success', 'user', 'Deleting messages...').send(true);
			await channel.bulkDelete(amount, true);
		});
}
