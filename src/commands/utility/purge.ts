import { ChannelType } from 'discord-api-types';
import { GuildTextBasedChannel } from 'discord.js';

import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('purge')
		.setDescription('Delete messages in a channel')
		.setModule('UTILITY')
		.setFormat('purge [channel] [amount]')
		.setExamples(['purge', 'purge #general', 'purge #general 50'])
		.setClientPermissions(['MANAGE_MESSAGES'])
		.setAuthority('MODERATOR')
		.addChannelOption((option) => option
			.setName('channel')
			.setDescription('Specify a channel')
			.addChannelType(ChannelType.GuildText)
			.setRequired(false))
		.addNumberOption((option) => option.setName('amount').setDescription('Specify an amount.').setMinValue(1).setMaxValue(100)
			.setRequired(false));

	public execute = async (ctx: Context): Promise<void> => {
		const channel = (ctx.interaction.options.getChannel('channel') ?? ctx.interaction.channel) as GuildTextBasedChannel;
		const amount = ctx.interaction.options.getNumber('amount') ?? 100;
		return channel.bulkDelete(amount, true).then(async (count) => ctx.embedify('success', 'user', `Deleted \`${count.size}\` messages.`, true));
	};
}
