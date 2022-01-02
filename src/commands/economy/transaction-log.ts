import { CommandInteraction } from 'discord.js';
import { GuildModel } from '../../models';
import {
	EconomicaClient,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	PermissionRole,
} from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('transaction-log')
		.setDescription('Manage the transaction logging channel.')
		.setGroup('econonomy')
		.setFormat('<view | set | reset> [channel]')
		.setExamples([
			'transaction-log view',
			'transaction-log set @transaction-logs',
			'transaction-log reset',
		])
		.setGlobal(false)
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('view').setDescription('View the transaction log channel.')
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('set')
				.setDescription('Set the transaction log channel.')
				.setRoles([new PermissionRole('ECONOMY MANAGER', true)])
				.addChannelOption((option) =>
					option.setName('channel').setDescription('Specify a channel').addChannelType(0)
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('reset')
				.setDescription('Reset the transaction log channel.')
				.setRoles([new PermissionRole('ECONOMY MANAGER', true)])
		);
	execute = async (client: EconomicaClient, interaction: CommandInteraction) => {
		const subcommand = interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const channelID = (await GuildModel.findOne({ guildID: interaction.guildId })).guildID;
			if (channelID) {
				return await interaction.reply(`The current transaction log is <#${channelID}>`);
			} else {
				return await interaction.reply('There is no transaction log.');
			}
		} else if (subcommand === 'set') {
			const channel = interaction.options.getChannel('channel');
			await GuildModel.findOneAndUpdate(
				{ guildID: interaction.guildId },
				{ transactionLogChannel: channel.id }
			);
			return await interaction.reply(`Transaction log set to ${channel}`);
		} else if (subcommand === 'reset') {
			await GuildModel.findOneAndUpdate(
				{ guildID: interaction.guildId },
				{ transactionLogChannel: null }
			);
		}
	};
}
