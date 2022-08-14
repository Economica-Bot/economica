import { parseNumber } from '@adrastopoulos/number-parser';

import { recordTransaction } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('work')
		.setDescription('Work to earn a sum')
		.setModule('INCOME')
		.setFormat('work')
		.setExamples(['work']);

	public execution = new ExecutionNode()
		.setName('Working...')
		.setValue(this.data.name)
		.setDescription((ctx) => `You worked and earned ${ctx.guildEntity.currency} \`${parseNumber(ctx.variables.amount)}\``)
		.setExecution(async (ctx) => {
			const { min, max } = ctx.guildEntity.incomes.work;
			const amount = Math.ceil(Math.random() * (max - min) + min);
			ctx.variables.amount = amount;
			await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'WORK', amount, 0);
		});
}
