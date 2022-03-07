import { parseNumber } from '@adrastopoulos/number-parser';

import { transaction } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('work')
		.setDescription('Work to earn a sum')
		.setModule('INCOME')
		.setFormat('work')
		.setExamples(['work']);

	public execute = async (ctx: Context): Promise<void> => {
		const { currency } = ctx.guildEntity;
		const { min, max } = ctx.guildEntity.incomes.work;
		const amount = Math.ceil(Math.random() * (max - min) + min);
		await transaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'WORK', amount, 0);
		await ctx.embedify('success', 'user', `You worked and earned ${currency}${parseNumber(amount)}`, false);
	};
}
