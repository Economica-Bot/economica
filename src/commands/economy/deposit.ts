import { parseNumber } from '@adrastopoulos/number-parser';

import { recordTransaction, validateAmount } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('deposit')
		.setDescription('Transfer funds from your wallet to your treasury')
		.setModule('ECONOMY')
		.setFormat('deposit <amount>')
		.setExamples(['deposit 1.5k', 'deposit all'])
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true));

	public execution = new ExecutionNode<'top'>()
		.setName('Depositing Funds')
		.setValue('deposit')
		.setDescription((ctx) => `${Emojis.CHECK} **Deposited ${ctx.guildEntity.currency} \`${parseNumber(ctx.variables.result)}\`**`)
		.setExecution(async (ctx) => {
			const result = await validateAmount(ctx, 'wallet');
			ctx.variables.result = result;
			await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.memberEntity, 'DEPOSIT', -result, result);
		});
}
