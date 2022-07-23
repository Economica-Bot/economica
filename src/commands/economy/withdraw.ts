import { parseNumber } from '@adrastopoulos/number-parser';

import { recordTransaction, validateAmount } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('withdraw')
		.setDescription('Transfer funds from your treasury to your wallet')
		.setModule('ECONOMY')
		.setFormat('withdraw <amount>')
		.setExamples(['withdraw 1.5k', 'withdraw all'])
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true));

	public execute = new ExecutionBuilder().setExecution(async (ctx) => {
		const { validated, result } = await validateAmount(ctx, 'treasury');
		if (!validated) return;
		await ctx.embedify('success', 'user', `Withdrew ${ctx.guildEntity.currency}${parseNumber(result)}`).send();
		await recordTransaction(
			ctx.client,
			ctx.guildEntity,
			ctx.memberEntity,
			ctx.memberEntity,
			'WITHDRAW',
			result,
			-result,
		);
	});
}
