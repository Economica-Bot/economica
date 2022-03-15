import { ChannelType } from 'discord-api-types';
import { TextChannel } from 'discord.js';

import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('infraction-log')
		.setDescription('Manage the infraction logging channel')
		.setModule('MODERATION')
		.setFormat('infraction-log <view | set | reset> [channel]')
		.setExamples(['infraction-log view', 'infraction-log set #infraction-logs', 'infraction-log reset'])
		.addSubcommand((subcommand) => subcommand.setName('view').setDescription('View the infraction log channel'))
		.addSubcommand((subcommand) => subcommand
			.setName('set')
			.setClientPermissions(['SEND_MESSAGES', 'EMBED_LINKS'])
			.setDescription('Set the infraction log channel')
			.setAuthority('ADMINISTRATOR')
			.addChannelOption((option) => option
				.setName('channel')
				.setDescription('Specify a channel')
				.addChannelType(ChannelType.GuildText)
				.setRequired(true)))
		.addSubcommand((subcommand) => subcommand.setName('reset').setDescription('Reset the infraction log channel').setAuthority('ADMINISTRATOR'));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const channelId = ctx.guildEntity.infractionLogId;
			if (channelId) {
				await ctx.embedify('info', 'user', `The current infraction log is <#${channelId}>.`).send();
			} else {
				await ctx.embedify('info', 'user', 'There is no infraction log.').send();
			}
		} else if (subcommand === 'set') {
			const channel = ctx.interaction.options.getChannel('channel') as TextChannel;
			if (!channel.permissionsFor(ctx.interaction.guild.me).has('SEND_MESSAGES') || !channel.permissionsFor(ctx.interaction.guild.me).has('EMBED_LINKS')) {
				await ctx.embedify('error', 'user', 'I need `SEND_MESSAGES` and `EMBED_LINKS` in that channel.').send(true);
			} else {
				ctx.guildEntity.infractionLogId = channel.id;
				await ctx.guildEntity.save();
				await ctx.embedify('success', 'user', `Infraction log set to ${channel}.`).send();
			}
		} else if (subcommand === 'reset') {
			ctx.guildEntity.infractionLogId = null;
			await ctx.guildEntity.save();
			await ctx.embedify('success', 'user', 'Infraction log reset.').send();
		}
	};
}
