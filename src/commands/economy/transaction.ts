import { Transaction } from '../../entities';
import { displayTransaction } from '../../lib';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('transaction')
		.setDescription('View and delete transactions')
		.setModule('ECONOMY')
		.setFormat('infraction <view | delete> [...arguments]')
		.setExamples([
			'transaction view 615a88b83f908631d40632c1',
			'transaction delete id 615a88b83f908631d40632c1',
			'transaction delete user @user',
			'transaction delete all',
		])
		.addSubcommand((subcommand) => subcommand
			.setName('view')
			.setDescription('View a transaction')
			.addStringOption((option) => option.setName('transaction_id').setDescription('Specify a transaction').setRequired(true)))
		.addSubcommandGroup((subcommandgroup) => subcommandgroup
			.setName('delete')
			.setDescription('Delete transaction data')
			.setAuthority('MANAGER')
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
		const transaction = await Transaction.findOne({ id });
		if (id && !transaction) {
			await ctx.embedify('error', 'user', `Could not find transaction with id \`${id}\``, true);
			return;
		}

		if (subcommand === 'view') {
			const embed = await displayTransaction(transaction);
			await ctx.interaction.reply({ embeds: [embed] });
		} if (subcommandgroup === 'delete') {
			if (subcommand === 'single') {
				await transaction.remove();
				await ctx.embedify('success', 'guild', `Deleted transaction \`${transaction.id}\``, true);
			} else if (subcommand === 'user') {
				const transactions = await Transaction.delete({ guild: ctx.guildEntity, target: { id: user.id } });
				await ctx.embedify('success', 'guild', `Deleted \`${transactions.affected}\` transactions.`, true);
			} else if (subcommand === 'all') {
				const transactions = await Transaction.delete({ guild: ctx.guildEntity });
				await ctx.embedify('success', 'guild', `Deleted \`${transactions.affected}\` transactions.`, true);
			}
		}
	};
}
