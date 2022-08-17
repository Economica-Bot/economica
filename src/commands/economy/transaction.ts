import { parseNumber } from '@adrastopoulos/number-parser';
import { PermissionFlagsBits } from 'discord.js';
import { FindOptionsWhere } from 'typeorm';

import { Transaction } from '../../entities';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('transaction')
		.setDescription('View and manage transactions')
		.setModule('MODERATION')
		.setFormat('transaction')
		.setExamples(['transaction'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.addUserOption((option) => option.setName('user').setDescription('Specify a user'));

	public execution = new Router()
		.get('', async (ctx) => {
			const user = ctx.interaction.options?.getUser('user', false);
			const where: FindOptionsWhere<Transaction>[] = user
				? [{ guild: { id: ctx.interaction.guildId }, agent: { userId: user.id } }, { guild: { id: ctx.interaction.guildId }, target: { userId: user.id } }]
				: [{ guild: { id: ctx.interaction.guildId } }];
			const transactions = await Transaction.find({ relations: ['target', 'agent'], where, order: { createdAt: 'DESC' } });
			const options: typeof ExecutionNode.prototype.options = [];
			if (user) {
				const outgoing = transactions.filter((transaction) => transaction.agent.userId === user.id);
				const incoming = transactions.filter((transaction) => transaction.target.userId === user.id);
				options.push(
					['select', `/user/${user.id}/outgoing`, 'Outgoing', `View transactions wherein this user was the agent. \`${outgoing.length}\` total`],
					['select', `/user/${user.id}/incoming`, 'Incoming', `View transactions wherein this user was the target. \`${incoming.length}\` total`],
				);
			} else {
				options.push(...transactions.map((transaction) => [
					'select',
					`/view/${transaction.id}`,
					`Transaction \`${transaction.id}\` | *${transaction.type}*`,
					`>>> ${Emojis.PERSON_ADD} **Target**: <@!${transaction.target.userId}>\n${Emojis.DEED} **Agent**: <@!${transaction.agent.userId}>\n${Emojis.TIME} **Created**: <t:${Math.trunc(transaction.createdAt.getTime() / 1000)}:R>`,
				] as const));
			}
			return new ExecutionNode()
				.setName('Transactions')
				.setDescription('View and manage transactions')
				.setOptions(...options);
		})
		.get('/user/:userId/:type', async (ctx, params) => {
			const { userId, type } = params;
			const where: FindOptionsWhere<Transaction> = type === 'outgoing'
				? { guild: { id: ctx.guildEntity.id }, agent: { userId } }
				: { guild: { id: ctx.guildEntity.id }, target: { userId } };
			const transactions = await Transaction.find({ relations: ['target', 'agent'], where });
			return new ExecutionNode()
				.setName('Transactions')
				.setDescription(`Viewing <@${userId}>'s \`${type}\` transactions`)
				.setOptions(
					...transactions.map((transaction) => [
						'select',
						`/view/${transaction.id}`,
						`Transaction \`${transaction.id}\` | *${transaction.type}*`,
						`>>> ${Emojis.PERSON_ADD} **Target**: <@!${transaction.target.userId}>\n${Emojis.DEED} **Agent**: <@!${transaction.agent.userId}>\n${Emojis.TIME} **Created**: <t:${Math.trunc(transaction.createdAt.getTime() / 1000)}:R>`,
					] as const),
					['back', ''],
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
					['back', ''],
				);
		})
		.get('/view/:id/delete', async (ctx, params) => {
			const { id } = params;
			await Transaction.delete({ id });
			return new ExecutionNode()
				.setName('Deleting...')
				.setDescription(`${Emojis.CHECK} Transaction Deleted`)
				.setOptions(['back', '']);
		});
}
