import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('infraction-log')
		.setDescription('Manage the infraction logging channel.')
		.setGroup('moderation')
		.setFormat('<view | set | reset> [channel]')
		.setExamples([
			'infraction-log view',
			'infraction-log set #infraction-logs',
			'infraction-log reset',
		])
		.setGlobal(false)
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('view').setDescription('View the infraction log channel.')
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('set')
				.setDescription('Set the infraction log channel.')
				.setUserPermissions(['ADMINISTRATOR'])
				.addChannelOption((option) =>
					option.setName('channel').setDescription('Specify a channel').addChannelType(0)
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('reset')
				.setDescription('Reset the infraction log channel.')
				.setUserPermissions(['ADMINISTRATOR'])
		);
	execute = async (ctx: Context) => {
		const subcommand = ctx.interaction.options.getSubcommand();
		switch (subcommand) {
			case 'view':
				const channelId = ctx.guildDocument.infractionLogChannel;
				if (channelId) {
					return await ctx.interaction.reply(`The current infraction log is <#${channelId}>`);
				} else {
					return await ctx.interaction.reply('There is no infraction log.');
				}
			case 'set':
				const channel = ctx.interaction.options.getChannel('channel');
				await ctx.guildDocument.update({ infractionLogChannel: channel.id });
				return await ctx.interaction.reply(`Infraction log set to ${channel}`);
			case 'reset':
				await ctx.guildDocument.update({ infractionLogChannel: null });
				return await ctx.interaction.reply('Infraction log reset.');
		}
	};
}