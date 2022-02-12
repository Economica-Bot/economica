import { Message } from 'discord.js';

import { transaction } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('work')
		.setDescription('Work to earn a sum.')
		.setModule('INCOME');

	public execute = async (ctx: Context): Promise<Message> => {
		const { min, max } = ctx.guildDocument.incomes.work;
		const amount = Math.ceil(Math.random() * (max - min) + min);
		transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			ctx.client.user.id,
			'WORK',
			amount,
			0,
			amount
		);

		return await ctx.embedify(
			'success',
			'user',
			`You worked and earned ${ctx.guildDocument.currency}${amount.toLocaleString()}`,
			false
		);
	};
}
