import { ChannelType } from 'discord-api-types';
import { TextChannel } from 'discord.js';

import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('bot-log')
		.setDescription('Manage the bot logging channel')
		.setModule('ADMIN')
		.setFormat('bot-log <view | set | reset> [channel]')
		.setExamples(['bot-log view', 'bot-log set #bot-logs', 'bot-log reset'])
		.addSubcommand((subcommand) => subcommand
			.setName('view').setDescription('View the bot log channel.'))
		.addSubcommand((subcommand) => subcommand
			.setName('set')
			.setDescription('Set the bot log channel.')
			.setAuthority('ADMINISTRATOR')
			.addChannelOption((option) => option
				.setName('channel')
				.setDescription('Specify a channel')
				.addChannelType(ChannelType.GuildText)
				.setRequired(true)))
		.addSubcommand((subcommand) => subcommand
			.setName('reset').setDescription('Reset the bot log channel.').setAuthority('ADMINISTRATOR'));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		const channel = ctx.interaction.options.getChannel('channel') as TextChannel;
		if (subcommand === 'view') {
			const channelId = ctx.guildDocument.botLogId;
			if (channelId) {
				await ctx.embedify('info', 'user', `The current bot log is <#${channelId}>.`, false);
			} else {
				await ctx.embedify('info', 'user', 'There is no bot log.', false);
			}
		} else if (subcommand === 'set') {
			if (!channel.permissionsFor(ctx.member).has('SEND_MESSAGES') || !channel.permissionsFor(ctx.member).has('EMBED_LINKS')) {
				await ctx.embedify('error', 'user', 'I need `SEND_MESSAGES` and `EMBED_LINKS` in that channel.', true);
			} else {
				ctx.guildDocument.botLogId = channel.id;
				await ctx.guildDocument.save();
				await ctx.embedify('success', 'user', `Bot log set to ${channel}.`, false);
			}
		} else if (subcommand === 'reset') {
			ctx.guildDocument.botLogId = null;
			ctx.guildDocument.save();
			await ctx.embedify('success', 'user', 'Bot log reset.', false);
		}
	};
}
