import { parseNumber } from '@adrastopoulos/number-parser';
import { PermissionFlagsBits } from 'discord.js';

import { Transaction } from '../../entities';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('transaction')
		.setDescription('View and manage transactions')
		.setModule('ECONOMY')
		.setFormat('transaction')
		.setExamples(['transaction'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.addUserOption((option) => option.setName('user').setDescription('Specify a user'));

	public execution = new Router()
		.get('', async (ctx) => {
			const user = ctx.interaction.options.getUser('user', false);
			if (user) return `/user/${user.id}`;
			const transactions = await Transaction.find({ relations: ['target', 'agent'], where: { guild: { id: ctx.interaction.guildId } }, order: { createdAt: 'DESC' } });
			return new ExecutionNode()
				.setName('Transactions')
				.setDescription('Viewing all transactions')
				.setOptions(...transactions.map((transaction) => [
					'select',
					`/view/${transaction.id}`,
					`Transaction \`${transaction.id}\` | *${transaction.type}*`,
					`>>> ${Emojis.PERSON_ADD} **Target**: <@!${transaction.target.userId}>\n${Emojis.DEED} **Agent**: <@!${transaction.agent.userId}>\n${Emojis.TIME} **Created**: <t:${Math.trunc(transaction.createdAt.getTime() / 1000)}:R>`,
				] as const));
		})
		.get('/user/:userId', async (ctx, params) => {
			const { userId } = params;
			const transactions = await Transaction.find({
				relations: ['target', 'agent'],
				where: [
					{ guild: { id: ctx.guildEntity.id }, agent: { userId } },
					{ guild: { id: ctx.guildEntity.id }, target: { userId } },
				],
			});
			return new ExecutionNode()
				.setName('Transactions')
				.setDescription(`Viewing <@${userId}>'s transactions`)
				.setOptions(
					...transactions.map((transaction) => [
						'select',
						`/view/${transaction.id}`,
						`Transaction \`${transaction.id}\` | *${transaction.type}*`,
						`>>> ${Emojis.PERSON_ADD} **Target**: <@!${transaction.target.userId}>\n${Emojis.DEED} **Agent**: <@!${transaction.agent.userId}>\n${Emojis.TIME} **Created**: <t:${Math.trunc(transaction.createdAt.getTime() / 1000)}:R>`,
					] as const),
				);
		})
		.get('/view/:id', async (ctx, params) => {
			const { id } = params;
			const transaction = await Transaction.findOne({ relations: ['target', 'agent'], where: { id } });
			return new ExecutionNode()
				.setName(`Transaction ${transaction.id} | ${transaction.type}`)
				.setDescription(`>>> ${Emojis.PERSON_ADD} **Target**: <@!${transaction.target.userId}>\n${Emojis.DEED} **Agent**: <@!${transaction.agent.userId}>\n${Emojis.TIME} **Created**: <t:${Math.trunc(transaction.createdAt.getTime() / 1000)}:R>`)
				.setOptions(
					['displayInline', '__**Wallet**__', `${ctx.guildEntity.currency} \`${parseNumber(transaction.wallet)}\``],
					['displayInline', '__**Treasury**__', `${ctx.guildEntity.currency} \`${parseNumber(transaction.treasury)}\``],
					['displayInline', '__**Total**__', `${ctx.guildEntity.currency} \`${parseNumber(transaction.wallet + transaction.treasury)}\``],
					['button', `/view/${id}/delete`, 'Delete'],
					['back', `/user/${transaction.target.userId}`],
				);
		})
		.get('/view/:id/delete', async (ctx, params) => {
			const { id } = params;
			const transaction = await Transaction.findOne({ relations: ['target'], where: { id } });
			return new ExecutionNode()
				.setName('Deleting...')
				.setDescription(`${Emojis.CHECK} Transaction Deleted`)
				.setOptions(['back', `/user/${transaction.target.userId}`]);
		});
}
