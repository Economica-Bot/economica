import { transaction, validateAmount } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('withdraw')
		.setDescription('Withdraw funds from your treasury to your wallet.')
		.setGroup('ECONOMY')
		.setFormat('<amount | all>')
		.setExamples(['withdraw all', 'withdraw 100'])
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true));

	execute = async (ctx: Context) => {
		const { currency } = ctx.guildDocument;
		const { validated, result } = await validateAmount(ctx, 'treasury');

		await transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			ctx.interaction.user.id,
			'WITHDRAW',
			result,
			-result,
			0
		);

		return await ctx.embedify('success', 'user', `Withdrew ${currency}${result.toLocaleString()}`);
	};
}
