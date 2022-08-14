import { ChannelType, PermissionFlagsBits } from 'discord.js';

import { Command, CommandError, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('infraction-log')
		.setDescription('Manage the infraction logging channel')
		.setModule('MODERATION')
		.setFormat('infraction-log <view | set | reset> [channel]')
		.setExamples(['infraction-log view', 'infraction-log set #infraction-logs', 'infraction-log reset'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

	public execution = new ExecutionNode()
		.setName('Infraction Log')
		.setValue('infraction-log')
		.setDescription((ctx) => `Manage the infraction logging channel.\n${ctx.guildEntity.infractionLogId ? `Current: <#${ctx.guildEntity.infractionLogId}> (\`${ctx.guildEntity.infractionLogId}\`)` : '**There is no infraction log.**'}`)
		.setOptions(() => [
			new ExecutionNode()
				.setName('Set')
				.setValue('infraction-log_set')
				.setType('select')
				.setDescription('Set the infraction log')
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
						ctx.guildEntity.infractionLogId = channel.id;
						await ctx.guildEntity.save();
					}
				})
				.setOptions((ctx) => [
					new ExecutionNode()
						.setName('infraction Log Updated')
						.setValue('infraction-log_set_result')
						.setType('display')
						.setDescription(`infraction log set to <#${ctx.guildEntity.infractionLogId}>`),
				]),
			new ExecutionNode()
				.setName('Reset')
				.setValue('infraction-log_reset')
				.setType('select')
				.setDescription('Reset the infraction log')
				.setExecution(async (ctx) => {
					ctx.guildEntity.infractionLogId = null;
					await ctx.guildEntity.save();
				})
				.setOptions(() => [
					new ExecutionNode()
						.setName('infraction Log Reset')
						.setValue('infraction-log_reset_result')
						.setType('display')
						.setDescription('infraction Log successfully reset!'),
				]),
		]);
}
