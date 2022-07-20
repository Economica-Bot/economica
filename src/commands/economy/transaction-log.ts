import { ChannelType, PermissionFlagsBits } from 'discord.js';

import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('transaction-log')
		.setDescription('Manage the transaction logging channel')
		.setModule('MODERATION')
		.setFormat('transaction-log <view | set | reset> [channel]')
		.setExamples(['transaction-log view', 'transaction-log set #transaction-logs', 'transaction-log reset'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

	public execute = new ExecutionBuilder()
		.setName('Transaction Log')
		.setValue('transaction-log')
		.setDescription('Manage the transaction logging channel')
		.setOptions([
			new ExecutionBuilder()
				.setName('View')
				.setValue('view')
				.setDescription('View the current transaction log')
				.setExecution(async (ctx, interaction) => {
					const { transactionLogId } = ctx.guildEntity;
					const content = transactionLogId
						? `The current transaction log is <#${transactionLogId}>.`
						: 'There is no transaction log.';
					const embed = ctx.embedify('info', 'user', content);
					await interaction.update({ embeds: [embed], components: [] });
				}),
			new ExecutionBuilder()
				.setName('Set')
				.setValue('set')
				.setDescription('Set the transaction log')
				.collectVar((collector) => collector
					.setProperty('channel')
					.setPrompt('Specify a channel')
					.addValidator((msg) => !!msg.mentions.channels.size, 'No channels mentioned.')
					.addValidator(
						(msg) => msg.mentions.channels.first().type === ChannelType.GuildText,
						'Invalid channel type - must be text.',
					)
					.setParser((msg) => msg.mentions.channels.first()))
				.setExecution(async (ctx, interaction) => {
					const channel = this.execute.getVariable('channel');
					if (
						!channel.permissionsFor(ctx.interaction.guild.members.me).has(PermissionFlagsBits.SendMessages)
						|| !channel.permissionsFor(ctx.interaction.guild.members.me).has(PermissionFlagsBits.EmbedLinks)
					) {
						const embed = ctx.embedify(
							'error',
							'user',
							'I need `SEND_MESSAGES` and `EMBED_LINKS` permissions in that channel.',
						);
						await interaction.editReply({ embeds: [embed], components: [] });
					} else {
						ctx.guildEntity.transactionLogId = channel.id;
						await ctx.guildEntity.save();
						const embed = ctx.embedify('success', 'user', `Transaction log set to ${channel}.`);
						await interaction.editReply({ embeds: [embed], components: [] });
					}
				}),
			new ExecutionBuilder()
				.setName('Reset')
				.setValue('reset')
				.setDescription('Reset the transaction log')
				.setExecution(async (ctx, interaction) => {
					ctx.guildEntity.transactionLogId = null;
					await ctx.guildEntity.save();
					const embed = ctx.embedify('info', 'user', 'Transaction log reset.');
					await interaction.update({ embeds: [embed], components: [] });
				}),
		]);
}
