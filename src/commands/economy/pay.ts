import { Message } from 'discord.js';

import { transaction, validateAmount } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('pay')
		.setDescription('Pay funds to another user.')
		.setGroup('ECONOMY')
		.setFormat('<user> <amount | all>')
		.setExamples(['pay @Wumpus all', 'pay @JohnDoe 100'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true))
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true));

	execute = async (ctx: Context): Promise<Message> => {
		const { currency } = ctx.guildDocument;
		const user = ctx.interaction.options.getUser('user');
		const { validated, result } = await validateAmount(ctx, 'wallet');
		if (!validated) return;
		transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			ctx.interaction.user.id,
			'GIVE_PAYMENT',
			-result,
			0,
			-result
		);

		transaction(
			ctx.client,
			ctx.interaction.guild.id,
			user.id,
			ctx.interaction.user.id,
			'RECEIVE_PAYMENT',
			result,
			0,
			result
		);

		return await ctx.embedify('success', 'user', `Paid ${user} ${currency}${result.toLocaleString()}`, false);
	};
}
