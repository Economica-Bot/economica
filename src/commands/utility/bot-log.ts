import { Message } from 'discord.js';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('bot-log')
		.setDescription('Manage the bot logging channel.')
		.setGroup('MODERATION')
		.setFormat('<view | set | reset> [channel]')
		.setExamples(['bot-log view', 'bot-log set #bot-logs', 'bot-log reset'])
		.addEconomicaSubcommand((subcommand) => subcommand.setName('view').setDescription('View the bot log channel.'))
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('set')
				.setDescription('Set the bot log channel.')
				.setAuthority('ADMINISTRATOR')
				.addChannelOption((option) =>
					option.setName('channel').setDescription('Specify a channel').addChannelType(0).setRequired(true)
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('reset').setDescription('Reset the bot log channel.').setAuthority('ADMINISTRATOR')
		);

	execute = async (ctx: Context): Promise<Message> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		switch (subcommand) {
			case 'view':
				const channelId = ctx.guildDocument.botLogChannel;
				if (channelId) {
					return await ctx.embedify('info', 'user', `The current bot log is <#${channelId}>.`, false);
				} else {
					return await ctx.embedify('info', 'user', 'There is no bot log.', false);
				}
			case 'set':
				const channel = ctx.interaction.options.getChannel('channel');
				await ctx.guildDocument.updateOne({ botLogChannel: channel.id });
				return await ctx.embedify('success', 'user', `bot log set to ${channel}.`, false);
			case 'reset':
				await ctx.guildDocument.update({ botLogChannel: null });
				return await ctx.embedify('success', 'user', 'bot log reset.', false);
		}
	};
}
