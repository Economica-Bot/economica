import { Transaction } from '../../entities';
import { displayTransaction } from '../../lib';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('transaction')
		.setDescription('View and delete transactions')
		.setModule('ECONOMY')
		.setFormat('transaction <view | delete> [...arguments]')
		.setExamples([
			'transaction view 615a88b83f908631d40632c1',
			'transaction delete id 615a88b83f908631d40632c1',
			'transaction delete user @user',
			'transaction delete all',
		])
		.setAuthority('MANAGER')
		.setDefaultPermission(false)
		.addSubcommandGroup((subcommandgroup) => subcommandgroup
			.setName('view')
			.setDescription('View transaction data')
			.addSubcommand((subcommand) => subcommand
				.setName('single')
				.setDescription('View a single transaction')
				.addStringOption((option) => option.setName('transaction_id').setDescription('Specify a transaction').setRequired(true)))
			.addSubcommand((subcommand) => subcommand
				.setName('user')
				.setDescription('View all transactions for a user')
				.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true)))
			.addSubcommand((subcommand) => subcommand.setName('all').setDescription('View all transactions')))
		.addSubcommandGroup((subcommandgroup) => subcommandgroup
			.setName('delete')
			.setDescription('Delete transaction data')
			.addSubcommand((subcommand) => subcommand
				.setName('single')
				.setDescription('Delete a single transaction')
				.addStringOption((option) => option.setName('transaction_id').setDescription('Specify a transaction').setRequired(true)))
			.addSubcommand((subcommand) => subcommand
				.setName('user')
				.setDescription('Delete all transactions for a user')
				.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true)))
			.addSubcommand((subcommand) => subcommand.setName('all').setDescription('Delete all transactions')));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommandgroup = ctx.interaction.options.getSubcommandGroup(false);
		const subcommand = ctx.interaction.options.getSubcommand();
		const user = ctx.interaction.options.getUser('user', false);
		const id = ctx.interaction.options.getString('transaction_id', false);
		const transaction = await Transaction.findOne({ relations: ['guild', 'target', 'agent'], where: { id, guild: ctx.guildEntity } });
		if (id && !transaction) {
			await ctx.embedify('error', 'user', `Could not find transaction with id \`${id}\``).send(true);
			return;
		}

		if (subcommandgroup === 'view') {
			if (subcommand === 'single') {
				const embed = await displayTransaction(transaction);
				await ctx.interaction.reply({ embeds: [embed] });
			} else if (subcommand === 'user') {
				const transactions = await Transaction.find({ relations: ['target', 'target.user'], where: { guild: ctx.guildEntity, target: { user: { id: user.id } } } });
				await ctx.embedify('info', 'user', `*${user.tag}'s Transactions:**\n\`${transactions.map((v) => v.id).join('`, `')}\``).send();
			} else if (subcommand === 'all') {
				const transactions = await Transaction.find({ guild: ctx.guildEntity });
				await ctx.embedify('info', 'user', `**All Transactions:**\n\`${transactions.map((v) => v.id).join('`, `')}\``).send();
			}
		} if (subcommandgroup === 'delete') {
			if (subcommand === 'single') {
				await transaction.remove();
				await ctx.embedify('success', 'guild', `Deleted transaction \`${id}\``).send(true);
			} else if (subcommand === 'user') {
				const transactions = await Transaction.find({ relations: ['guild', 'target', 'target.user'], where: { guild: ctx.guildEntity, target: { user: { id: user.id } } } });
				await Transaction.remove(transactions);
				await ctx.embedify('success', 'guild', `Deleted \`${transactions.length}\` transactions.`).send(true);
			} else if (subcommand === 'all') {
				const transactions = await Transaction
					.createQueryBuilder('transaction')
					.where('guild = :id', { id: ctx.interaction.guildId })
					.delete()
					.execute();
				await ctx.embedify('success', 'guild', `Deleted \`${transactions.affected}\` transactions.`).send(true);
			}
		}
	};
}
