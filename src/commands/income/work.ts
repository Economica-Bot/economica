import { transaction } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder().setName('work').setDescription('Work to earn a sum.').setGroup('INCOME');

	execute = async (ctx: Context) => {
		const { min, max } = ctx.guildDocument.income.work;
		const amount = Math.ceil(Math.random() * (max - min) + min);
		await transaction(
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
			`You worked and earned ${ctx.guildDocument.currency}${amount.toLocaleString()}`
		);
	};
}
