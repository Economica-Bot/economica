import { parseNumber } from '@adrastopoulos/number-parser';

import { recordTransaction } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('crime')
		.setDescription('Commit a felony to swindle a sum')
		.setModule('INCOME')
		.setFormat('crime')
		.setExamples(['crime']);

	public execute = new ExecutionBuilder()
		.setExecution(async (ctx) => {
			const { min, max, chance, minfine, maxfine } = ctx.guildEntity.incomes.crime;
			const amount = Math.ceil(Math.random() * (max - min) + min);
			const fine = Math.ceil(Math.random() * (maxfine - minfine) + minfine);
			if (Math.random() * 100 > chance) {
				await ctx.embedify('warn', 'user', `You were caught and fined ${ctx.guildEntity.currency}${parseNumber(fine)}.`).send();
				await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'CRIME_FINE', 0, -fine);
			} else {
				await ctx.embedify('success', 'user', `You successfully committed a crime and earned ${ctx.guildEntity.currency}${parseNumber(amount)}.`).send();
				await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'CRIME_SUCCESS', amount, 0);
			}
		});
}
