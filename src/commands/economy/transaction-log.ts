import { ChannelType, PermissionFlagsBits, TextChannel } from 'discord.js';

import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('transaction-log')
		.setDescription('Manage the transaction logging channel')
		.setModule('ECONOMY')
		.setFormat('transaction-log <view | set | reset> [channel]')
		.setExamples(['transaction-log view', 'transaction-log set #transaction-logs', 'transaction-log reset'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString())
		.addSubcommand((subcommand) => subcommand.setName('view').setDescription('View the transaction log channel'))
		.addSubcommand((subcommand) => subcommand
			.setName('set')
			.setClientPermissions(['SendMessages', 'EmbedLinks'])
			.setDescription('Set the transaction log channel')
			.addChannelOption((option) => option
				.setName('channel')
				.setDescription('Specify a channel')
				.addChannelTypes(ChannelType.GuildText)
				.setRequired(true)))
		.addSubcommand((subcommand) => subcommand.setName('reset').setDescription('Reset the transaction log channel'));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const channelId = ctx.guildEntity.transactionLogId;
			if (channelId) {
				await ctx.embedify('info', 'user', `The current transaction log is <#${channelId}>.`).send();
			} else {
				await ctx.embedify('warn', 'user', 'There is no transaction log.').send();
			}
		} if (subcommand === 'set') {
			const channel = ctx.interaction.options.getChannel('channel') as TextChannel;
			if (!channel.permissionsFor(ctx.interaction.guild.members.me).has('SendMessages') || !channel.permissionsFor(ctx.interaction.guild.members.me).has('EmbedLinks')) {
				await ctx.embedify('error', 'user', 'I need `SEND_MESSAGES` and `EMBED_LINKS` in that channel.').send(true);
			} else {
				ctx.guildEntity.transactionLogId = channel.id;
				await ctx.guildEntity.save();
				await ctx.embedify('success', 'user', `Transaction log set to ${channel}.`).send();
			}
		} if (subcommand === 'reset') {
			ctx.guildEntity.transactionLogId = null;
			await ctx.guildEntity.save();
			await ctx.embedify('success', 'user', 'Transaction log reset.').send();
		}
	};
}
