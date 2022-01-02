import { CommandInteraction, MessageEmbed } from 'discord.js';
import { isValidObjectId, Types } from 'mongoose';
import { TransactionModel } from '../../models';
import {
	EconomicaClient,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	PermissionRole,
} from '../../structures';
import { getCurrencySymbol } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('transaction')
		.setDescription('View and delete transactions.')
		.setGroup('economy')
		.setFormat('(view <transaction_id> | delete <id | user | all> [transaction_id | user])')
		.setExamples([
			'transaction view 615a88b83f908631d40632c1',
			'transaction delete id 615a88b83f908631d40632c1',
			'transaction delete user @Wumpus',
			'transaction delete all',
		])
		.setGlobal(false)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('view')
				.setDescription('View a transaction.')
				.addStringOption((option) =>
					option
						.setName('transaction_id')
						.setDescription('Specify a transaction.')
						.setRequired(true)
				)
		)
		.addEconomicaSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('delete')
				.setDescription('Delete transaction data.')
				.setRoles([new PermissionRole('ECONOMY MANAGER', true)])
				.addEconomicaSubcommand((subcommand) =>
					subcommand
						.setName('id')
						.setDescription('Delete a single transaction.')
						.addStringOption((option) =>
							option
								.setName('transaction_id')
								.setDescription('Specify a transaction.')
								.setRequired(true)
						)
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand
						.setName('user')
						.setDescription('Delete all transactions for a user.')
						.addUserOption((option) =>
							option.setName('user').setDescription('Specify a user.').setRequired(true)
						)
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand.setName('all').setDescription('Delete all transactions.')
				)
		);

	execute = async (client: EconomicaClient, interaction: CommandInteraction) => {
		const subcommandgroup = interaction.options.getSubcommandGroup(false);
		const subcommand = interaction.options.getSubcommand();
		const cSymbol = await getCurrencySymbol(interaction.guildId);
		if (subcommand === 'view') {
			const id = interaction.options.getString('transaction_id');
			if (!isValidObjectId(id)) {
				return await interaction.reply(`Invalid ID: \`${id}\``);
			}
			const transaction = await TransactionModel.findOne({ _id: id });
			if (!transaction) {
				return await interaction.reply(`Could not find transaction with ID \`${id}\``);
			}
			const embed = new MessageEmbed()
				.setColor('GOLD')
				.setAuthor({
					name: `Transaction ${transaction._id}`,
					iconURL: interaction.guild.iconURL(),
				})
				.setDescription(
					`Transaction for <@!${transaction.userID}>\nType: \`${transaction.transactionType}\` | ${transaction.memo}`
				)
				.addFields([
					{
						name: '__**Wallet**__',
						value: `${cSymbol}${transaction.wallet.toLocaleString()}`,
						inline: true,
					},
					{
						name: '__**Treasury**__',
						value: `${cSymbol}${transaction.treasury.toLocaleString()}`,
						inline: true,
					},
					{
						name: '__**Total**__',
						value: `${cSymbol}${transaction.total.toLocaleString()}`,
						inline: true,
					},
				]);

			return await interaction.reply({ embeds: [embed] });
		} else if (subcommandgroup === 'delete') {
			if (subcommand === 'id') {
				const _id = interaction.options.getString('transaction_id');
				if (!isValidObjectId(_id)) {
					return await interaction.reply(`Invalid ID: \`${_id}\``);
				}
				const transaction = await TransactionModel.findOneAndDelete({
					_id,
					guildID: interaction.guild.id,
				});
				if (!transaction) {
					return await interaction.reply(`Could not find transaction with ID \`${_id}\``);
				}
				return await interaction.reply(`Deleted transaction \`${_id}\``);
			} else if (subcommand === 'user') {
				const user = interaction.options.getUser('user');
				const transactions = await TransactionModel.deleteMany({
					guildID: interaction.guild.id,
					userID: user.id,
				});
				interaction.reply(`Deleted \`${transactions.deletedCount}\` transactions.`);
			} else if (subcommand === 'all') {
				const transactions = await TransactionModel.deleteMany({ guildID: interaction.guild.id });
				interaction.reply(`Deleted \`${transactions.deletedCount}\` transactions.`);
			}
		}
	};
}
