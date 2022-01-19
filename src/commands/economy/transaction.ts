import { MessageEmbed } from 'discord.js';
import { isValidObjectId } from 'mongoose';
import { TransactionModel } from '../../models';
import {
	Context,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	PermissionRole,
} from '../../structures';

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

	execute = async (ctx: Context) => {
		const subcommandgroup = ctx.interaction.options.getSubcommandGroup(false);
		const subcommand = ctx.interaction.options.getSubcommand();
		const { currency } = ctx.guildDocument;
		if (subcommand === 'view') {
			const id = ctx.interaction.options.getString('transaction_id');
			if (!isValidObjectId(id)) {
				return await ctx.interaction.reply(`Invalid Id: \`${id}\``);
			}
			const transaction = await TransactionModel.findOne({ _id: id });
			if (!transaction) {
				return await ctx.interaction.reply(`Could not find transaction with Id \`${id}\``);
			}
			const embed = new MessageEmbed()
				.setColor('GOLD')
				.setAuthor({
					name: `Transaction ${transaction._id}`,
					iconURL: ctx.interaction.guild.iconURL(),
				})
				.setDescription(
					`Transaction for <@!${transaction.userId}>\nType: \`${transaction.transactionType}\` | ${transaction.memo}`
				)
				.addFields([
					{
						name: '__**Wallet**__',
						value: `${currency}${transaction.wallet.toLocaleString()}`,
						inline: true,
					},
					{
						name: '__**Treasury**__',
						value: `${currency}${transaction.treasury.toLocaleString()}`,
						inline: true,
					},
					{
						name: '__**Total**__',
						value: `${currency}${transaction.total.toLocaleString()}`,
						inline: true,
					},
				]);

			return await ctx.interaction.reply({ embeds: [embed] });
		} else if (subcommandgroup === 'delete') {
			if (subcommand === 'id') {
				const _id = ctx.interaction.options.getString('transaction_id');
				if (!isValidObjectId(_id)) {
					return await ctx.interaction.reply(`Invalid Id: \`${_id}\``);
				}
				const transaction = await TransactionModel.findOneAndDelete({
					_id,
					guildId: ctx.interaction.guildId,
				});
				if (!transaction) {
					return await ctx.interaction.reply(`Could not find transaction with Id \`${_id}\``);
				}
				return await ctx.interaction.reply(`Deleted transaction \`${_id}\``);
			} else if (subcommand === 'user') {
				const user = ctx.interaction.options.getUser('user');
				const transactions = await TransactionModel.deleteMany({
					guildId: ctx.interaction.guildId,
					userId: user.id,
				});
				ctx.interaction.reply(`Deleted \`${transactions.deletedCount}\` transactions.`);
			} else if (subcommand === 'all') {
				const transactions = await TransactionModel.deleteMany({
					guildId: ctx.interaction.guildId,
				});
				ctx.interaction.reply(`Deleted \`${transactions.deletedCount}\` transactions.`);
			}
		}
	};
}
