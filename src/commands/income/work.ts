import { parseNumber } from '@adrastopoulos/number-parser';

import { recordTransaction } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('work')
		.setDescription('Work to earn a sum')
		.setModule('INCOME')
		.setFormat('work')
		.setExamples(['work']);

	public execute = new ExecutionBuilder().setExecution(async (ctx) => {
		const { currency } = ctx.guildEntity;
		const { min, max } = ctx.guildEntity.incomes.work;
		const amount = Math.ceil(Math.random() * (max - min) + min);
		await ctx.embedify('success', 'user', `You worked and earned ${currency}${parseNumber(amount)}`).send();
		await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'WORK', amount, 0);
	});
}
