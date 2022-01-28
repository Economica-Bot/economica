import { Context, EconomicaCommand, EconomicaSlashCommandBuilder, PermissionRole } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('transaction-log')
		.setDescription('Manage the transaction logging channel.')
		.setGroup('economy')
		.setFormat('<view | set | reset> [channel]')
		.setExamples(['transaction-log view', 'transaction-log set @transaction-logs', 'transaction-log reset'])
		.setGlobal(false)
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('view').setDescription('View the transaction log channel.')
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('set')
				.setDescription('Set the transaction log channel.')
				.setRoles([new PermissionRole('ECONOMY MANAGER', true)])
				.addChannelOption((option) => option.setName('channel').setDescription('Specify a channel').addChannelType(0))
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('reset')
				.setDescription('Reset the transaction log channel.')
				.setRoles([new PermissionRole('ECONOMY MANAGER', true)])
		);

	execute = async (ctx: Context) => {
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const channelId = ctx.guildDocument.transactionLogChannel;
			if (channelId) {
				return await ctx.embedify('info', 'user', `The current transaction log is <#${channelId}>.`);
			} else {
				return await ctx.embedify('warn', 'user', 'There is no transaction log.');
			}
		} else if (subcommand === 'set') {
			const channel = ctx.interaction.options.getChannel('channel');
			await ctx.guildDocument.update({ transactionLogChannel: channel.id });
			return await ctx.embedify('success', 'user', `Transaction log set to ${channel}.`);
		} else if (subcommand === 'reset') {
			await ctx.guildDocument.update({ transactionLogChannel: null });
			return await ctx.embedify('success', 'user', 'Transaction log reset.');
		}
	};
}
