import { ChannelType, PermissionFlagsBits } from 'discord.js';

import { Command, CommandError, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('transaction-log')
		.setDescription('Manage the transaction logging channel')
		.setModule('MODERATION')
		.setFormat('transaction-log <view | set | reset> [channel]')
		.setExamples(['transaction-log view', 'transaction-log set #transaction-logs', 'transaction-log reset'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

	public execution = new ExecutionNode()
		.setName('Transaction Log')
		.setValue('transaction-log')
		.setDescription((ctx) => `Manage the transaction logging channel.\n${ctx.guildEntity.transactionLogId ? `Current: <#${ctx.guildEntity.transactionLogId}> (\`${ctx.guildEntity.transactionLogId}\`)` : '**There is no transaction log.**'}`)
		.setOptions(() => [
			new ExecutionNode()
				.setName('Set')
				.setValue('transaction-log_set')
				.setType('select')
				.setDescription('Set the transaction log')
				.collectVar((collector) => collector
					.setProperty('channel')
					.setPrompt('Specify a channel')
					.addValidator((msg) => !!msg.mentions.channels.size, 'No channels mentioned.')
					.addValidator((msg) => msg.mentions.channels.first().type === ChannelType.GuildText, 'Invalid channel type - must be text.')
					.setParser((msg) => msg.mentions.channels.first()))
				.setExecution(async (ctx) => {
					const { channel } = ctx.variables;
					if (!channel.permissionsFor(ctx.interaction.guild.members.me).has(PermissionFlagsBits.SendMessages + PermissionFlagsBits.EmbedLinks)) throw new CommandError('I need `SEND_MESSAGES` and `EMBED_LINKS` permissions in that channel.');
					else {
						ctx.guildEntity.transactionLogId = channel.id;
						await ctx.guildEntity.save();
					}
				})
				.setOptions((ctx) => [
					new ExecutionNode()
						.setName('Transaction Log Updated')
						.setValue('transaction-log_set_result')
						.setType('display')
						.setDescription(`Transaction log set to <#${ctx.guildEntity.transactionLogId}>`),
				]),
			new ExecutionNode()
				.setName('Reset')
				.setValue('transaction-log_reset')
				.setType('select')
				.setDescription('Reset the transaction log')
				.setExecution(async (ctx) => {
					ctx.guildEntity.transactionLogId = null;
					await ctx.guildEntity.save();
				})
				.setOptions(() => [
					new ExecutionNode()
						.setName('Transaction Log Reset')
						.setValue('transaction-log_reset_result')
						.setType('display')
						.setDescription('Transaction Log successfully reset!'),
				]),
		]);
}
