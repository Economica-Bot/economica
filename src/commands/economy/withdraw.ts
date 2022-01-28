import { parseString } from '@adrastopoulos/number-parser';

import { getEconInfo, transaction } from '../../lib/util';
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
		const { treasury } = await getEconInfo(ctx.interaction.guildId, ctx.interaction.user.id);
		const amount = ctx.interaction.options.getString('amount');
		const result = amount === 'all' ? treasury : parseString(amount);

		if (result) {
			if (result < 1) return await ctx.embedify('error', 'user', `Amount less than 0`);
			if (result > treasury)
				return await ctx.embedify('error', 'user', `Exceeds current treasury:${currency}${treasury.toLocaleString()}`);
		} else {
			return await ctx.embedify('error', 'user', 'Please enter a valid amount.');
		}

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
