import { displayTransaction, validateObjectId } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

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
				.addStringOption((option) => option.setName('transaction_id').setDescription('Specify a transaction.').setRequired(true)))
			.addSubcommand((subcommand) => subcommand
				.setName('user')
				.setDescription('Delete all transactions for a user')
				.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true)))
			.addSubcommand((subcommand) => subcommand.setName('all').setDescription('Delete all transactions')));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommandgroup = ctx.interaction.options.getSubcommandGroup(false);
		const subcommand = ctx.interaction.options.getSubcommand();
		const user = ctx.interaction.options.getUser('user', false);
		const { valid, document, model } = await validateObjectId(ctx, 'Transaction');
		if (!valid) return;
		if (subcommand === 'view') {
			const embed = await displayTransaction(document);
			await ctx.interaction.reply({ embeds: [embed] });
		} if (subcommandgroup === 'delete') {
			if (subcommand === 'id') {
				document.deleteOne();
				await ctx.embedify('success', 'guild', `Deleted transaction \`${document._id}\``, true);
			} else if (subcommand === 'user') {
				const transactions = await model.deleteMany({ guild: ctx.guildDocument, userId: user.id });
				await ctx.embedify('success', 'guild', `Deleted \`${transactions.deletedCount}\` transactions.`, true);
			} else if (subcommand === 'all') {
				const transactions = await model.deleteMany({ guild: ctx.guildDocument });
				await ctx.embedify('success', 'guild', `Deleted \`${transactions.deletedCount}\` transactions.`, true);
			}
		}
	};
}
