import { Message } from 'discord.js';

import { transaction } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('crime')
		.setDescription('Commit a crime to earn a sum.')
		.setGroup('INCOME');

	public execute = async (ctx: Context): Promise<Message> => {
		const { currency } = ctx.guildDocument;
		const { min, max, chance, minfine, maxfine } = ctx.guildDocument.income.crime;
		const amount = Math.ceil(Math.random() * (max - min) + min);
		const fine = Math.ceil(Math.random() * (maxfine - minfine) + minfine);

		if (Math.random() * 100 > chance) {
			transaction(
				ctx.client,
				ctx.interaction.guildId,
				ctx.interaction.user.id,
				ctx.client.user.id,
				'CRIME_FINE',
				0,
				-fine,
				-fine
			);

			return await ctx.embedify(
				'warn',
				'user',
				`You were caught and fined ${currency}${fine.toLocaleString()}.`,
				false
			);
		}

		transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			ctx.client.user.id,
			'CRIME_SUCCESS',
			amount,
			0,
			amount
		);

		return await ctx.embedify(
			'success',
			'user',
			`You comitted a crime and earned ${currency}${amount.toLocaleString()}.`,
			false
		);
	};
}
