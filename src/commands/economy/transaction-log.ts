import { Message } from 'discord.js';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('transaction-log')
		.setDescription('Manage the transaction logging channel.')
		.setGroup('ECONOMY')
		.setFormat('<view | set | reset> [channel]')
		.setExamples(['transaction-log view', 'transaction-log set @transaction-logs', 'transaction-log reset'])
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('view').setDescription('View the transaction log channel.')
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('set')
				.setDescription('Set the transaction log channel.')
				.setAuthority('MANAGER')
				.addChannelOption((option) =>
					option.setName('channel').setDescription('Specify a channel').addChannelType(0).setRequired(true)
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('reset').setDescription('Reset the transaction log channel.').setAuthority('MANAGER')
		);

	execute = async (ctx: Context): Promise<Message> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const channelId = ctx.guildDocument.transactionLogChannel;
			if (channelId) {
				return await ctx.embedify('info', 'user', `The current transaction log is <#${channelId}>.`, false);
			} else {
				return await ctx.embedify('warn', 'user', 'There is no transaction log.', false);
			}
		} else if (subcommand === 'set') {
			const channel = ctx.interaction.options.getChannel('channel');
			await ctx.guildDocument.updateOne({ transactionLogChannel: channel.id });
			return await ctx.embedify('success', 'user', `Transaction log set to ${channel}.`, false);
		} else if (subcommand === 'reset') {
			await ctx.guildDocument.updateOne({ transactionLogChannel: null });
			return await ctx.embedify('success', 'user', 'Transaction log reset.', false);
		}
	};
}
