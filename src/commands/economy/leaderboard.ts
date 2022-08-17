import { parseNumber } from '@adrastopoulos/number-parser';
import { FindOptionsOrder } from 'typeorm';

import { Member } from '../../entities';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('View top balances')
		.setModule('ECONOMY')
		.setFormat('leaderboard [page]')
		.setExamples(['leaderboard', 'leaderboard 3']);

	public execution = new Router()
		.get('', () => new ExecutionNode()
			.setName('Leaderboard')
			.setDescription('View the top balances in the server')
			.setOptions(
				['select', '/wallet', 'Wallet', 'View the top wallet balances'],
				['select', '/treasury', 'Treasury', 'View the top treasury balances'],
				['select', '/total', 'Total', 'View the top total balances'],
			))
		.get('/:type', async (ctx, params) => {
			const { type } = params;
			const order: FindOptionsOrder<Member> = type === 'wallet'
				? { wallet: 'DESC' }
				: type === 'treasury' ? { treasury: 'DESC' }
					: { wallet: 'DESC', treasury: 'DESC' };
			const members = await Member.find({ order, where: { guildId: ctx.guildEntity.id } });
			return new ExecutionNode()
				.setName(type.toUpperCase())
				.setDescription(`There are \`${members.length}\` members in this leaderboard`)
				.setOptions(
					...members.map((member) => {
						const balance = type === 'total' ? (member.wallet + member.treasury) : type === 'wallet' ? member.wallet : member.treasury;
						return ['displayNumbered', `${ctx.guildEntity.currency} \`${parseNumber(balance)}\``, `<@${member.userId}>`] as const;
					}),
					['back', ''],
				);
		});
}
