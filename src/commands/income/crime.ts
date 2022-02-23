import { transaction } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('crime')
		.setDescription('Commit a felony to swindle a sum')
		.setModule('INCOME');

	public execute = async (ctx: Context): Promise<void> => {
		const { currency } = ctx.guildDocument;
		const { min, max, chance, minfine, maxfine } = ctx.guildDocument.incomes.crime;
		const amount = Math.ceil(Math.random() * (max - min) + min);
		const fine = Math.ceil(Math.random() * (maxfine - minfine) + minfine);
		if (Math.random() * 100 > chance) {
			await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.clientDocument, 'CRIME_FINE', 0, -fine);
			await ctx.embedify('warn', 'user', `You were caught and fined ${currency}${fine.toLocaleString()}.`, false);
		} else {
			await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.clientDocument, 'CRIME_SUCCESS', amount, 0);
			await ctx.embedify('success', 'user', `You successfully committed a crime and earned ${currency}${amount.toLocaleString()}.`, false);
		}
	};
}
