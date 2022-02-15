import { transaction } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('beg')
		.setDescription('Beg to earn a sum.')
		.setModule('INCOME');

	public execute = async (ctx: Context): Promise<void> => {
		const { currency } = ctx.guildDocument;
		const { min, max, chance } = ctx.guildDocument.incomes.beg;
		const amount = Math.ceil(Math.random() * (max - min) + min);
		if (Math.random() * 100 > chance) {
			return await ctx.embedify('warn', 'user', 'You begged and earned nothing :cry:', false);
		}

		await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.clientDocument, 'BEG', amount, 0);
		return await ctx.embedify('success', 'user', `You begged and earned ${currency}${amount.toLocaleString()}.`, false);
	};
}
