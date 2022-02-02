import { Message } from 'discord.js';

import { validateObjectId } from '../../lib/validate';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('transaction')
		.setDescription('View and delete transactions.')
		.setGroup('ECONOMY')
		.setFormat('(view <transaction_id> | delete <id | user | all> [transaction_id | user])')
		.setExamples([
			'transaction view 615a88b83f908631d40632c1',
			'transaction delete id 615a88b83f908631d40632c1',
			'transaction delete user @Wumpus',
			'transaction delete all',
		])
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
				.setAuthority('MANAGER')
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

	public execute = async (ctx: Context): Promise<Message | void> => {
		const subcommandgroup = ctx.interaction.options.getSubcommandGroup(false);
		const subcommand = ctx.interaction.options.getSubcommand();
		const user = ctx.interaction.options.getUser('user', false);
		const { valid, document, model } = await validateObjectId(ctx, 'transaction');
		if (!valid) return;

		const { currency } = ctx.guildDocument;

		if (subcommand === 'view') {
			const embed = await ctx
				.embedify('info', 'guild', `Transaction for <@!${document.userId}>\nType: \`${document.type}\``)
				.addFields([
					{
						name: '__**Wallet**__',
						value: `${currency}${document.wallet.toLocaleString()}`,
						inline: true,
					},
					{
						name: '__**Treasury**__',
						value: `${currency}${document.treasury.toLocaleString()}`,
						inline: true,
					},
					{
						name: '__**Total**__',
						value: `${currency}${document.total.toLocaleString()}`,
						inline: true,
					},
				]);

			return await ctx.interaction.reply({ embeds: [embed] });
		} else if (subcommandgroup === 'delete') {
			if (subcommand === 'id') {
				document.deleteOne();
				return await ctx.embedify('success', 'guild', `Deleted transaction \`${document._id}\``, true);
			} else if (subcommand === 'user') {
				const transactions = await model.deleteMany({
					guildId: ctx.interaction.guildId,
					userId: user.id,
				});
				return await ctx.embedify('success', 'guild', `Deleted \`${transactions.deletedCount}\` transactions.`, true);
			} else if (subcommand === 'all') {
				const transactions = await model.deleteMany({
					guildId: ctx.interaction.guildId,
				});
				return await ctx.embedify('success', 'guild', `Deleted \`${transactions.deletedCount}\` transactions.`, true);
			}
		}
	};
}
