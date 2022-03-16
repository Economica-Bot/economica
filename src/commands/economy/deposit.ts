import { parseNumber } from '@adrastopoulos/number-parser';
import { recordTransaction, validateAmount } from '../../lib';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('deposit')
		.setDescription('Trasnfer funds from your wallet to your treasury')
		.setModule('ECONOMY')
		.setFormat('deposit <amount>')
		.setExamples(['deposit 1.5k', 'deposit all'])
		.setAuthority('USER')
		.setDefaultPermission(false)
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const { validated, result } = await validateAmount(ctx, 'wallet');
		if (!validated) return;
		await ctx.embedify('success', 'user', `Deposited ${ctx.guildEntity.currency}${parseNumber(result)}`).send();
		await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.memberEntity, 'DEPOSIT', -result, result);
	};
}
