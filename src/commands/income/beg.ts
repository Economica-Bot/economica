import { parseNumber } from '@adrastopoulos/number-parser';

import { transaction } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('beg')
		.setDescription('Grovel in hopes of earning a meager sum')
		.setModule('INCOME')
		.setFormat('beg')
		.setExamples(['beg']);

	public execute = async (ctx: Context): Promise<void> => {
		const { min, max, chance } = ctx.guildEntity.incomes.beg;
		const amount = Math.ceil(Math.random() * (max - min) + min);
		if (Math.random() * 100 > chance) return ctx.embedify('warn', 'user', 'You begged and earned nothing :cry:', false);
		transaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'BEG', amount, 0);
		return ctx.embedify('success', 'user', `You begged and earned ${ctx.guildEntity.currency}${parseNumber(amount)}.`, false);
	};
}
