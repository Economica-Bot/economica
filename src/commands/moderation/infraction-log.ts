import { Channel, ChannelType, PermissionFlagsBits } from 'discord.js';

import { VariableCollector } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('infraction-log')
		.setDescription('Manage the infraction logging channel')
		.setModule('MODERATION')
		.setFormat('infraction-log <view | set | reset> [channel]')
		.setExamples(['infraction-log view', 'infraction-log set #infraction-logs', 'infraction-log reset'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

	public execution = new Router()
		.get('', (ctx) => new ExecutionNode()
			.setName('infraction Log')
			.setDescription(`Manage the infraction logging channel.\n${ctx.guildEntity.infractionLogId ? `Current: <#${ctx.guildEntity.infractionLogId}> (\`${ctx.guildEntity.infractionLogId}\`)` : '**There is no infraction log.**'}`)
			.setOptions(
				['select', '/select', 'Set', 'Set the infraction log'],
				['select', '/reset', 'Reset', 'Reset the infraction log'],
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
			ctx.guildEntity.infractionLogId = channel.id;
			await ctx.guildEntity.save();
			return new ExecutionNode()
				.setName('Infraction Log Updated')
				.setDescription(`${Emojis.CHECK} infraction log set to <#${ctx.guildEntity.infractionLogId}>`)
				.setOptions(['back', '']);
		})
		.get('/reset', async (ctx) => {
			ctx.guildEntity.infractionLogId = null;
			await ctx.guildEntity.save();
			return new ExecutionNode()
				.setName('Resetting...')
				.setDescription(`${Emojis.CHECK} infraction log successfully reset`)
				.setOptions(['back', '']);
		});
}
