import { parseNumber } from '@adrastopoulos/number-parser';

import { recordTransaction } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('work')
		.setDescription('Work to earn a sum')
		.setModule('INCOME')
		.setFormat('work')
		.setExamples(['work']);

	public execution = new Router()
		.get('', async (ctx) => {
			const { min, max } = ctx.guildEntity.incomes.work;
			const amount = Math.ceil(Math.random() * (max - min) + min);
			await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'WORK', amount, 0);
			return new ExecutionNode()
				.setName('Working Hard & Hardly Working...')
				.setDescription(`You worked and earned ${ctx.guildEntity.currency} \`${parseNumber(amount)}\``);
		});
}
