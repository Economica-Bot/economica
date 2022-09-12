import { parseNumber } from '@adrastopoulos/number-parser';

import { recordTransaction, validateAmount } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('deposit')
		.setDescription('Transfer funds from your wallet to your treasury')
		.setModule('ECONOMY')
		.setFormat('deposit <amount>')
		.setExamples(['deposit 1.5k', 'deposit all'])
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true));

	public execution = new Router()
		.get('', async (ctx) => {
			const result = await validateAmount(ctx, 'wallet');
			await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.memberEntity, 'DEPOSIT', -result, result);
			return new ExecutionNode()
				.setName('Depositing Funds')
				.setDescription(`${Emojis.CHECK} **Deposited ${ctx.guildEntity.currency} \`${parseNumber(result)}\`**`);
		});
}
