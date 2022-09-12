import { parseNumber } from '@adrastopoulos/number-parser';

import { recordTransaction } from '../../lib';
import { Command, CommandError, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('beg')
		.setDescription('Grovel in hopes of earning a meager sum')
		.setModule('INCOME')
		.setFormat('beg')
		.setExamples(['beg']);

	public execution = new Router()
		.get('', async (ctx) => {
			const { min, max, chance } = ctx.guildEntity.incomes.beg;
			const amount = Math.ceil(Math.random() * (max - min) + min);
			if (Math.random() * 100 > chance) throw new CommandError('You begged and earned nothing :cry:');
			await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'BEG', amount, 0);
			return new ExecutionNode()
				.setName('Begging for money...')
				.setDescription(`You begged and earned ${ctx.guildEntity.currency} \`${parseNumber(amount)}\``);
		});
}
