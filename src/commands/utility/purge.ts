import { ChannelType, PermissionFlagsBits } from 'discord.js';

import { Command, CommandError, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

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
			.setDescription('Specify an amount (default 100).')
			.setMinValue(1)
			.setMaxValue(100)
			.setRequired(false));

	public execution = new ExecutionNode<'top'>()
		.setName('Purging messages...')
		.setValue('purge')
		.setDescription((ctx) => `Deleted \`${ctx.variables.deleted}\` messages.`)
		.setExecution(async (ctx) => {
			const channel = ctx.interaction.options.getChannel('channel') ?? ctx.interaction.channel;
			if (!channel.permissionsFor(ctx.interaction.guild.members.me).has(PermissionFlagsBits.ManageMessages)) throw new CommandError('I need `MANAGE_MESSAGES` in that channel.');
			if (channel.type !== ChannelType.GuildText) throw new CommandError('Invalid channel.');
			const amount = ctx.interaction.options.getInteger('amount') ?? 100;
			const deleted = await channel.bulkDelete(amount, true);
			ctx.variables.deleted = deleted.size;
		});
}
