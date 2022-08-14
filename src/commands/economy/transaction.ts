import { parseNumber } from '@adrastopoulos/number-parser';
import { PermissionFlagsBits } from 'discord.js';
import { FindOptionsWhere } from 'typeorm';

import { Transaction } from '../../entities';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';
import { Emojis } from '../../typings';

const displayTransaction = (transaction: Transaction): ExecutionNode[] => [
	new ExecutionNode()
		.setName('__**Wallet**__')
		.setValue('transaction_wallet')
		.setType('displayInline')
		.setDescription(`${transaction.guild.currency} \`${parseNumber(transaction.wallet)}\``),
	new ExecutionNode()
		.setName('__**Treasury**__')
		.setValue('transaction_treasury')
		.setType('displayInline')
		.setDescription(`${transaction.guild.currency} \`${parseNumber(transaction.treasury)}\``),
	new ExecutionNode()
		.setName('__**Total**__')
		.setValue('transaction_total')
		.setType('displayInline')
		.setDescription(`${transaction.guild.currency} \`${parseNumber(transaction.treasury + transaction.wallet)}\``),
];

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('transaction')
		.setDescription('View and manage transactions')
		.setModule('MODERATION')
		.setFormat('transaction')
		.setExamples(['transaction'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.addUserOption((option) => option.setName('user').setDescription('Specify a user'));

	public execution = new ExecutionNode<'top'>()
		.setName('Transactions')
		.setValue('transaction')
		.setDescription('View and manage transactions')
		.setOptions(async (ctx) => {
			const user = ctx.interaction.options.getUser('user', false);
			const where: FindOptionsWhere<Transaction>[] = user
				? [{ guild: { id: ctx.interaction.guildId }, agent: { userId: user.id } }, { guild: { id: ctx.interaction.guildId }, target: { userId: user.id } }]
				: [{ guild: { id: ctx.interaction.guildId } }];
			const transactions = await Transaction.find({ relations: ['target', 'agent', 'guild'], where });
			return transactions.map((transaction) => new ExecutionNode()
				.setName(transaction.type)
				.setValue(`transaction_${transaction.id}`)
				.setType('select')
				.setDescription(`>>> ${Emojis.PERSON_ADD} **Target**: <@!${transaction.target.userId}>\n${Emojis.DEED} **Agent**: <@!${transaction.agent.userId}>`)
				.setOptions(() => [
					...displayTransaction(transaction),
					new ExecutionNode()
						.setName('Delete')
						.setValue('transaction_delete')
						.setType('button')
						.setDescription(`${Emojis.CHECK} Transaction Deleted`)
						.setExecution(async () => { transaction.remove(); }),
				]));
		});
}
