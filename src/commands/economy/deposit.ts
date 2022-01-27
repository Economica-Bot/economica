import { parse_string } from '@adrastopoulos/number-parser';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import { getEconInfo, transaction } from '../../lib/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('deposit')
		.setDescription('Deposit funds from your wallet to your treasury.')
		.setGroup('economy')
		.setFormat('<amount | all>')
		.setExamples(['deposit all', 'deposit 100'])
		.setGlobal(false)
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true));

	execute = async (ctx: Context) => {
		const { currency } = ctx.guildDocument;
		const { wallet } = await getEconInfo(ctx.interaction.guildId, ctx.interaction.user.id);
		const amount = ctx.interaction.options.getString('amount');
		const result = amount === 'all' ? wallet : parse_string(amount);

		if (result) {
			if (result < 1) return await ctx.embedify('error', 'user', `Amount less than 0`);
			if (result > wallet)
				return await ctx.embedify('error', 'user', `Exceeds current wallet:${currency}${wallet.toLocaleString()}`);
		} else {
			return await ctx.embedify('error', 'user', 'Please enter a valid amount.');
		}

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
