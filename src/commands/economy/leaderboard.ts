/* eslint-disable max-classes-per-file */
import { parseNumber } from '@adrastopoulos/number-parser';
import { FindOptionsOrder } from 'typeorm';

import { Member } from '../../entities';
import { Command, Context, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

const formatLeaderboard = async (ctx: Context, type: 'wallet' | 'treasury' | 'total') => {
	const order: FindOptionsOrder<Member> = type === 'wallet'
		? { wallet: 'DESC' }
		: type === 'treasury' ? { treasury: 'DESC' }
			: { wallet: 'DESC', treasury: 'DESC' };
	const members = await Member.find({ order, where: { guildId: ctx.guildEntity.id } });
	return members.map((member) => new ExecutionNode<'display'>()
		.setName(`${ctx.guildEntity.currency} \`${parseNumber(type === 'total' ? (member.wallet + member.treasury) : type === 'treasury' ? member.treasury : member.wallet)}\``)
		.setValue(`leaderboard_${type}_${member.userId}`)
		.setType('displayNumbered')
		.setDescription(`<@${member.userId}>`));
};

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('View top balances')
		.setModule('ECONOMY')
		.setFormat('leaderboard [page]')
		.setExamples(['leaderboard', 'leaderboard 3']);

	public execution = new ExecutionNode<'top'>()
		.setName('Leaderboard')
		.setValue('leaderboard')
		.setDescription('View the top balances in the server')
		.setOptions(() => [
			new ExecutionNode()
				.setName('Wallet')
				.setValue('leaderboard_wallet')
				.setType('select')
				.setDescription('View the top wallet balances')
				.setReturnable()
				.setOptions(async (ctx) => formatLeaderboard(ctx, 'wallet')),
			new ExecutionNode()
				.setName('Treasury')
				.setValue('leaderboard_treasury')
				.setType('select')
				.setDescription('View the top treasury balances')
				.setReturnable()
				.setOptions(async (ctx) => formatLeaderboard(ctx, 'treasury')),
			new ExecutionNode()
				.setName('Total')
				.setValue('leaderboard_total')
				.setType('select')
				.setDescription('View the top combined balances')
				.setReturnable()
				.setOptions(async (ctx) => formatLeaderboard(ctx, 'total')),
		]);
}
