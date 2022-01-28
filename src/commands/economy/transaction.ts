import { isValidObjectId } from 'mongoose';

import { TransactionModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder, PermissionRole } from '../../structures';

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
					option.setName('transaction_id').setDescription('Specify a transaction.').setRequired(true)
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
							option.setName('transaction_id').setDescription('Specify a transaction.').setRequired(true)
						)
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand
						.setName('user')
						.setDescription('Delete all transactions for a user.')
						.addUserOption((option) => option.setName('user').setDescription('Specify a user.').setRequired(true))
				)
				.addEconomicaSubcommand((subcommand) => subcommand.setName('all').setDescription('Delete all transactions.'))
		);

	execute = async (ctx: Context) => {
		const { currency } = ctx.guildDocument;
		const subcommandgroup = ctx.interaction.options.getSubcommandGroup(false);
		const subcommand = ctx.interaction.options.getSubcommand();
		const user = ctx.interaction.options.getUser('user', false);
		const _id = ctx.interaction.options.getString('transaction_id', false);
		if (_id && !isValidObjectId(_id)) {
			return await ctx.embedify('error', 'user', 'Please enter a valid transaction id.');
		}

		const transaction = await TransactionModel.findOne({ _id });
		if (!transaction) {
			return await ctx.interaction.reply(`Could not find transaction with id \`${_id}\``);
		}

		if (subcommand === 'view') {
			const embed = await ctx.embedify(
				'info',
				'guild',
				`Transaction for <@!${transaction.userId}>\nType: \`${transaction.type}\``,
				false
			);
			embed.addFields([
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
				transaction.deleteOne();
				return await ctx.embedify('success', 'guild', `Deleted transaction \`${_id}\``);
			} else if (subcommand === 'user') {
				const transactions = await TransactionModel.deleteMany({
					guildId: ctx.interaction.guildId,
					userId: user.id,
				});
				return await ctx.embedify('success', 'guild', `Deleted \`${transactions.deletedCount}\` transactions.`);
			} else if (subcommand === 'all') {
				const transactions = await TransactionModel.deleteMany({
					guildId: ctx.interaction.guildId,
				});
				return await ctx.embedify('success', 'guild', `Deleted \`${transactions.deletedCount}\` transactions.`);
			}
		}
	};
}
