import { transaction, validateAmount } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('deposit')
		.setDescription('Deposit funds from your wallet to your treasury.')
		.setGroup('ECONOMY')
		.setFormat('<amount | all>')
		.setExamples(['deposit all', 'deposit 100'])
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true));

	execute = async (ctx: Context) => {
		const { currency } = ctx.guildDocument;
		const { validated, result } = await validateAmount(ctx, 'wallet');
		if (!validated) return;
		await transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			ctx.interaction.user.id,
			'DEPOSIT',
			-result,
			result,
			0
		);

		return await ctx.embedify('success', 'user', `Deposited ${currency}${result.toLocaleString()}`);
	};
}
