import { ChannelType } from 'discord-api-types';
import { Message, TextChannel } from 'discord.js';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('bot-log')
		.setDescription('Manage the infraction logging channel.')
		.setModule('ADMIN')
		.setFormat('<view | set | reset> [channel]')
		.setExamples(['bot-log view', 'bot-log set #bot-logs', 'bot-log reset'])
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('view').setDescription('View the infraction log channel.')
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('set')
				.setDescription('Set the bot log channel.')
				.setAuthority('ADMINISTRATOR')
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('Specify a channel')
						.addChannelType(ChannelType.GuildText)
						.setRequired(true)
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('reset').setDescription('Reset the bot log channel.').setAuthority('ADMINISTRATOR')
		);

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		switch (subcommand) {
			case 'view':
				const channelId = ctx.guildDocument.botLogChannelId;
				if (channelId) {
					return await ctx.embedify('info', 'user', `The current bot log is <#${channelId}>.`, false);
				} else {
					return await ctx.embedify('info', 'user', 'There is no bot log.', false);
				}
			case 'set':
				const channel = ctx.interaction.options.getChannel('channel') as TextChannel;
				if (
					!channel.permissionsFor(ctx.member).has('SEND_MESSAGES') ||
					!channel.permissionsFor(ctx.member).has('EMBED_LINKS')
				) {
					return await ctx.embedify('error', 'user', 'I need `SEND_MESSAGES` and `EMBED_LINKS` in that channel.', true);
				} else {
					ctx.guildDocument.botLogChannelId = channel.id;
					await ctx.guildDocument.save();
					return await ctx.embedify('success', 'user', `Bot log set to ${channel}.`, false);
				}
			case 'reset':
				ctx.guildDocument.botLogChannelId = null;
				ctx.guildDocument.save();
				return await ctx.embedify('success', 'user', 'Bot log reset.', false);
		}
	};
}
