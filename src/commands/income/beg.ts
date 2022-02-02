import { Message } from 'discord.js';

import { transaction } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('beg')
		.setDescription('Beg to earn a sum.')
		.setGroup('INCOME');

	public execute = async (ctx: Context): Promise<Message> => {
		const { currency } = ctx.guildDocument;
		const { min, max, chance } = ctx.guildDocument.income.beg;
		const amount = Math.ceil(Math.random() * (max - min) + min);

		if (Math.random() * 100 > chance)
			return await ctx.embedify('warn', 'user', 'You begged and earned nothing :cry:', false);

		transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			ctx.client.user.id,
			'BEG',
			amount,
			0,
			amount
		);

		return await ctx.embedify('success', 'user', `You begged and earned ${currency}${amount.toLocaleString()}.`, false);
	};
}
