import { GuildTextBasedChannel, Message } from 'discord.js';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('purge')
		.setDescription('Purge messages from a channel.')
		.setGroup('UTILITY')
		.setFormat('[channel] [amount]')
		.setExamples(['purge', 'purge #general', 'purge #general 50'])
		.setClientPermissions(['MANAGE_MESSAGES'])
		.setAuthority('MODERATOR')
		.addChannelOption((option) =>
			option
				.setName('channel')
				.setDescription('Specify a channel')
				.addChannelType(0)
				//.addChannelType(ChannelType.GuildText)
				.setRequired(false)
		)
		.addNumberOption((option) =>
			option.setName('amount').setDescription('Specify an amount.').setMinValue(1).setMaxValue(100).setRequired(false)
		);

	execute = async (ctx: Context): Promise<Message> => {
		const channel = (ctx.interaction.options.getChannel('channel') ?? ctx.interaction.channel) as GuildTextBasedChannel;
		const amount = ctx.interaction.options.getNumber('amount') ?? 100;
		return await channel.bulkDelete(amount, true).then(async (count) => {
			return await ctx.embedify('success', 'user', `Deleted \`${count.size}\` messages.`, true);
		});
	};
}
