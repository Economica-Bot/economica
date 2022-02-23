import { transaction, validateAmount } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('deposit')
		.setDescription('Trasnfer funds from your wallet to your treasury')
		.setModule('ECONOMY')
		.setFormat('deposit <amount>')
		.setExamples(['deposit 1.5k', 'deposit all'])
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const { validated, result } = await validateAmount(ctx, 'wallet');
		if (!validated) return;
		await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.memberDocument, 'DEPOSIT', -result, result);
		await ctx.embedify('success', 'user', `Deposited ${ctx.guildDocument.currency}${result.toLocaleString()}`, false);
	};
}
