import { PermissionFlagsBits, TextChannel } from 'discord.js';
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
					const channelId = ctx.guildEntity.transactionLogId;
					const embed = ctx.embedify('info', 'user', `The current transaction log is <#${channelId}>.`);
					await interaction.update({ embeds: [embed], components: [] });
				}),
			new ExecutionBuilder()
				.setName('Set')
				.setValue('set')
				.setDescription('Set the transaction log')
				.setExecution(async (ctx, interaction) => {
					await interaction.reply({ content: 'Mention a channel', ephemeral: true });
					const msgs = await interaction.channel.awaitMessages({ max: 1, filter: (msg) => msg.author.id === ctx.interaction.user.id });
					const channel = msgs.first().mentions.channels.first() as TextChannel;
					if (!channel) {
						await interaction.followUp({ content: 'Could not find mention', ephemeral: true });
					} else if (!channel.permissionsFor(ctx.interaction.guild.members.me).has('SendMessages') || !channel.permissionsFor(ctx.interaction.guild.members.me).has('EmbedLinks')) {
						const embed = ctx.embedify('error', 'user', 'I need `SEND_MESSAGES` and `EMBED_LINKS` permissions in that channel.');
						await interaction.followUp({ embeds: [embed], components: [] });
					} else {
						ctx.guildEntity.transactionLogId = channel.id;
						await ctx.guildEntity.save();
						const embed = ctx.embedify('success', 'user', `Transaction log set to ${channel}.`);
						await interaction.followUp({ embeds: [embed], components: [] });
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
