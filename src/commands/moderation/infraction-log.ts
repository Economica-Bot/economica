import { Message } from 'discord.js';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('infraction-log')
		.setDescription('Manage the infraction logging channel.')
		.setGroup('MODERATION')
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
					option.setName('channel').setDescription('Specify a channel').addChannelType(0).setRequired(true)
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('reset').setDescription('Reset the infraction log channel.').setAuthority('ADMINISTRATOR')
		);

	execute = async (ctx: Context): Promise<Message> => {
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
				const channel = ctx.interaction.options.getChannel('channel');
				await ctx.guildDocument.updateOne({ infractionLogChannelId: channel.id });
				return await ctx.embedify('success', 'user', `Infraction log set to ${channel}.`, false);
			case 'reset':
				await ctx.guildDocument.update({ infractionLogChannelId: null });
				return await ctx.embedify('success', 'user', 'Infraction log reset.', false);
		}
	};
}
