import { ChannelType } from 'discord-api-types';
import { TextChannel } from 'discord.js';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('transaction-log')
		.setDescription('Manage the transaction logging channel.')
		.setModule('ECONOMY')
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
					option
						.setName('channel')
						.setDescription('Specify a channel')
						.addChannelType(ChannelType.GuildText)
						.setRequired(true)
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('reset').setDescription('Reset the transaction log channel.').setAuthority('MANAGER')
		);

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const channelId = ctx.guildDocument.transactionLogChannelId;
			if (channelId) {
				return await ctx.embedify('info', 'user', `The current transaction log is <#${channelId}>.`, false);
			} else {
				return await ctx.embedify('warn', 'user', 'There is no transaction log.', false);
			}
		} else if (subcommand === 'set') {
			const channel = ctx.interaction.options.getChannel('channel') as TextChannel;
			if (
				!channel.permissionsFor(ctx.member).has('SEND_MESSAGES') ||
				!channel.permissionsFor(ctx.member).has('EMBED_LINKS')
			) {
				return await ctx.embedify('error', 'user', 'I need `SEND_MESSAGES` and `EMBED_LINKS` in that channel.', true);
			} else {
				ctx.guildDocument.transactionLogChannelId = channel.id;
				await ctx.guildDocument.save();
				return await ctx.embedify('success', 'user', `Transaction log set to ${channel}.`, false);
			}
		} else if (subcommand === 'reset') {
			ctx.guildDocument.transactionLogChannelId = null;
			await ctx.guildDocument.save();
			return await ctx.embedify('success', 'user', 'Transaction log reset.', false);
		}
	};
}
