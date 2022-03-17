import { parseNumber } from '@adrastopoulos/number-parser';
import { recordTransaction, validateAmount } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('withdraw')
		.setDescription('Transfer funds from your treasury to your wallet')
		.setModule('ECONOMY')
		.setFormat('withdraw <amount>')
		.setExamples(['withdraw 1.5k', 'withdraw all'])
		.setAuthority('USER')
		.setDefaultPermission(false)
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const { validated, result } = await validateAmount(ctx, 'treasury');
		if (!validated) return;
		await ctx.embedify('success', 'user', `Withdrew ${ctx.guildEntity.currency}${parseNumber(result)}`).send();
		await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.memberEntity, 'WITHDRAW', result, -result);
	};
}
