import { transaction } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('work')
		.setDescription('Work to earn a sum.')
		.setModule('INCOME');

	public execute = async (ctx: Context): Promise<void> => {
		const { currency } = ctx.guildDocument;
		const { min, max } = ctx.guildDocument.incomes.work;
		const amount = Math.ceil(Math.random() * (max - min) + min);
		await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.clientDocument, 'WORK', amount, 0);
		return await ctx.embedify('success', 'user', `You worked and earned ${currency}${amount.toLocaleString()}`, false);
	};
}
