import { parseNumber } from '@adrastopoulos/number-parser';

import { recordTransaction, validateAmount } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('withdraw')
		.setDescription('Transfer funds from your treasury to your wallet')
		.setModule('ECONOMY')
		.setFormat('withdraw <amount>')
		.setExamples(['withdraw 1.5k', 'withdraw all'])
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true));

	public execution = new Router()
		.get('', async (ctx) => {
			const result = await validateAmount(ctx, 'treasury');
			await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.memberEntity, 'WITHDRAW', result, -result);
			return new ExecutionNode()
				.setName('Withdrawing Funds...')
				.setDescription(`${Emojis.CHECK} **Withdrew ${ctx.guildEntity.currency} \`${parseNumber(result)}\`**`);
		});
}
