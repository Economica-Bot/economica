import { parse_string } from '@adrastopoulos/number-parser';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import { getEconInfo, transaction } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('pay')
		.setDescription('Pay funds to another user.')
		.setGroup('economy')
		.setFormat('<user> <amount | all>')
		.setExamples(['pay @Wumpus all', 'pay @JohnDoe 100'])
		.setGlobal(false)
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true))
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true));

	execute = async (ctx: Context) => {
		const { currency } = ctx.guildDocument;
		const user = ctx.interaction.options.getUser('user');
		const { wallet } = await getEconInfo(ctx.interaction.guildId, user.id);
		const amount = ctx.interaction.options.getString('amount');
		const result = amount === 'all' ? wallet : parse_string(amount);

		if (result) {
			if (result < 1) return await ctx.embedify('error', 'user', `Amount less than 0`);
			if (result > wallet) return await ctx.embedify('error', 'user', `Exceeds current wallet:${currency}${wallet}`);
		} else {
			return await ctx.embedify('error', 'user', 'Please enter a valid amount.');
		}

		await transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			ctx.interaction.user.id,
			'GIVE_PAYMENT',
			-result,
			0,
			-result
		);

		await transaction(
			ctx.client,
			ctx.interaction.guild.id,
			user.id,
			ctx.interaction.user.id,
			'RECEIVE_PAYMENT',
			result,
			0,
			result
		);

		return await ctx.embedify('success', 'user', `Paid ${user} ${currency}${amount.toLocaleString()}`);
	};
}
