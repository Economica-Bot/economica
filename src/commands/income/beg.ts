import { transaction } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('beg')
		.setDescription('Grovel in hopes of earning a meager sum')
		.setModule('INCOME');

	public execute = async (ctx: Context): Promise<void> => {
		const { currency } = ctx.guildDocument;
		const { min, max, chance } = ctx.guildDocument.incomes.beg;
		const amount = Math.ceil(Math.random() * (max - min) + min);
		if (Math.random() * 100 > chance) return ctx.embedify('warn', 'user', 'You begged and earned nothing :cry:', false);
		await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.clientDocument, 'BEG', amount, 0);
		return ctx.embedify('success', 'user', `You begged and earned ${currency}${amount.toLocaleString()}.`, false);
	};
}
