import { Channel, ChannelType, PermissionFlagsBits } from 'discord.js';

import { VariableCollector } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('transaction-log')
		.setDescription('Manage the transaction logging channel')
		.setModule('MODERATION')
		.setFormat('transaction-log <view | set | reset> [channel]')
		.setExamples(['transaction-log view', 'transaction-log set #transaction-logs', 'transaction-log reset'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

	public execution = new Router()
		.get('', (ctx) => new ExecutionNode()
			.setName('Transaction Log')
			.setDescription(`Manage the transaction logging channel.\n${ctx.guildEntity.transactionLogId ? `Current: <#${ctx.guildEntity.transactionLogId}> (\`${ctx.guildEntity.transactionLogId}\`)` : '**There is no transaction log.**'}`)
			.setOptions(
				['select', '/select', 'Set', 'Set the transaction log'],
				['select', '/reset', 'Reset', 'Reset the transaction log'],
			))
		.get('/select', async (ctx) => {
			const channel = await new VariableCollector<Channel>()
				.setProperty('channel')
				.setPrompt('Specify a channel')
				.addValidator((msg) => !!msg.mentions.channels.size, 'No channels mentioned.')
				.addValidator((msg) => msg.mentions.channels.first().type === ChannelType.GuildText, 'Invalid channel type - must be text.')
				.addValidator(
					(msg) => {
						const channel = msg.mentions.channels.first();
						if (channel.type !== ChannelType.GuildText) return false;
						return channel.permissionsFor(ctx.interaction.guild.members.me).has(PermissionFlagsBits.SendMessages + PermissionFlagsBits.EmbedLinks);
					},
					'I need `SEND_MESSAGES` and `EMBED_LINKS` permissions in that channel.',
				)
				.setParser((msg) => msg.mentions.channels.first())
				.execute(ctx);
			ctx.guildEntity.transactionLogId = channel.id;
			await ctx.guildEntity.save();
			return new ExecutionNode()
				.setName('Transaction Log Updated')
				.setDescription(`${Emojis.CHECK} Transaction log set to <#${ctx.guildEntity.transactionLogId}>`)
				.setOptions(['back', '']);
		})
		.get('/reset', async (ctx) => {
			ctx.guildEntity.transactionLogId = null;
			await ctx.guildEntity.save();
			return new ExecutionNode()
				.setName('Resetting...')
				.setDescription(`${Emojis.CHECK} Transaction log successfully reset`)
				.setOptions(['back', '']);
		});
}
