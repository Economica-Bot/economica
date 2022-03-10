import { parseNumber } from '@adrastopoulos/number-parser';

import { recordTransaction } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('crime')
		.setDescription('Commit a felony to swindle a sum')
		.setModule('INCOME')
		.setFormat('crime')
		.setExamples(['crime']);

	public execute = async (ctx: Context): Promise<void> => {
		const { min, max, chance, minfine, maxfine } = ctx.guildEntity.incomes.crime;
		const amount = Math.ceil(Math.random() * (max - min) + min);
		const fine = Math.ceil(Math.random() * (maxfine - minfine) + minfine);
		if (Math.random() * 100 > chance) {
			await ctx.embedify('warn', 'user', `You were caught and fined ${ctx.guildEntity.currency}${fine.toLocaleString()}.`, false);
			await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'CRIME_FINE', 0, -fine);
		} else {
			await ctx.embedify('success', 'user', `You successfully committed a crime and earned ${ctx.guildEntity.currency}${parseNumber(amount)}.`, false);
			await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'CRIME_SUCCESS', amount, 0);
		}
	};
}
