import { ChannelType } from 'discord-api-types';
import { TextChannel } from 'discord.js';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('infraction-log')
		.setDescription('Manage the infraction logging channel.')
		.setModule('MODERATION')
		.setFormat('<view | set | reset> [channel]')
		.setExamples(['infraction-log view', 'infraction-log set #infraction-logs', 'infraction-log reset'])
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('view').setDescription('View the infraction log channel.')
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('set')
				.setDescription('Set the infraction log channel.')
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
			subcommand.setName('reset').setDescription('Reset the infraction log channel.').setAuthority('ADMINISTRATOR')
		);

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		switch (subcommand) {
			case 'view':
				const channelId = ctx.guildDocument.infractionLogChannelId;
				if (channelId) {
					return await ctx.embedify('info', 'user', `The current infraction log is <#${channelId}>.`, false);
				} else {
					return await ctx.embedify('info', 'user', 'There is no infraction log.', false);
				}
			case 'set':
				const channel = ctx.interaction.options.getChannel('channel') as TextChannel;
				if (
					!channel.permissionsFor(ctx.member).has('SEND_MESSAGES') ||
					!channel.permissionsFor(ctx.member).has('EMBED_LINKS')
				) {
					return await ctx.embedify('error', 'user', 'I need `SEND_MESSAGES` and `EMBED_LINKS` in that channel.', true);
				} else {
					await ctx.guildDocument.updateOne({ infractionLogChannelId: channel.id });
					return await ctx.embedify('success', 'user', `Infraction log set to ${channel}.`, false);
				}
			case 'reset':
				await ctx.guildDocument.update({ infractionLogChannelId: null });
				return await ctx.embedify('success', 'user', 'Infraction log reset.', false);
		}
	};
}
