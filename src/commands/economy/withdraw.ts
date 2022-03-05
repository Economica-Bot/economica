import { transaction, validateAmount } from '../../lib';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('withdraw')
		.setDescription('Transfer funds from your treasury to your wallet')
		.setModule('ECONOMY')
		.setFormat('withdraw <amount>')
		.setExamples(['withdraw 1.5k', 'withdraw all'])
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const { validated, result } = await validateAmount(ctx, 'treasury');
		if (!validated) return;
		await transaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.memberEntity, 'WITHDRAW', result, -result);
		await ctx.embedify('success', 'user', `Withdrew ${ctx.guildEntity.currency}${result.toLocaleString()}`, false);
	};
}
