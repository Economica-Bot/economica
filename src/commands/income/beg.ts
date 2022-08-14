import { parseNumber } from '@adrastopoulos/number-parser';

import { recordTransaction } from '../../lib';
import { Command, CommandError, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('beg')
		.setDescription('Grovel in hopes of earning a meager sum')
		.setModule('INCOME')
		.setFormat('beg')
		.setExamples(['beg']);

	public execution = new ExecutionNode()
		.setName('Begging for money!')
		.setValue(this.data.name)
		.setDescription(this.data.description)
		.setExecution(async (ctx) => {
			const { min, max, chance } = ctx.guildEntity.incomes.beg;
			const amount = Math.ceil(Math.random() * (max - min) + min);
			ctx.variables.amount = amount;
			if (Math.random() * 100 > chance) throw new CommandError('You begged and earned nothing :cry:');
			await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'BEG', amount, 0);
		})
		.setOptions((ctx) => [
			new ExecutionNode()
				.setName('Begging Success!')
				.setValue('beg_result')
				.setType('display')
				.setDescription(`You begged and earned ${ctx.guildEntity.currency} \`${parseNumber(ctx.variables.amount)}\``),
		]);
}
