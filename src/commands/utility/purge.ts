import { ChannelType, PermissionFlagsBits, TextChannel } from 'discord.js';

import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('purge')
		.setDescription('Delete messages in a channel')
		.setModule('UTILITY')
		.setFormat('purge [channel] [amount]')
		.setExamples(['purge', 'purge #general', 'purge #general 50'])
		.setClientPermissions(['ManageMessages'])
		.setPermissions(PermissionFlagsBits.ManageMessages.toString())
		.addChannelOption((option) => option
			.setName('channel')
			.setDescription('Specify a channel')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(false))
		.addNumberOption((option) => option
			.setName('amount')
			.setDescription('Specify an amount.')
			.setMinValue(1)
			.setMaxValue(100)
			.setRequired(false));

	public execute = async (ctx: Context): Promise<void> => {
		const channel = (ctx.interaction.options.getChannel('channel') ?? ctx.interaction.channel) as TextChannel;
		if (!channel.permissionsFor(ctx.interaction.guild.me).has('ManageMessages')) {
			await ctx.embedify('error', 'bot', 'I need `MANAGE_MESSAGES` in that channel.').send(true);
			return;
		}

		const amount = ctx.interaction.options.getNumber('amount') ?? 100;
		const count = await channel.bulkDelete(amount, true);
		await ctx.embedify('success', 'user', `Deleted \`${count.size}\` messages.`).send(true);
	};
}
