import { parseNumber } from '@adrastopoulos/number-parser';

import { recordTransaction } from '../../lib';
import { Command, CommandError, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('crime')
		.setDescription('Commit a felony to swindle a sum')
		.setModule('INCOME')
		.setFormat('crime')
		.setExamples(['crime']);

	public execution = new Router()
		.get('', async (ctx) => {
			const { min, max, chance, minfine, maxfine } = ctx.guildEntity.incomes.crime;
			const amount = Math.ceil(Math.random() * (max - min) + min);
			const fine = Math.ceil(Math.random() * (maxfine - minfine) + minfine);
			if (Math.random() * 100 > chance) {
				await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'CRIME_FINE', 0, -fine);
				throw new CommandError(`You were caught and fined ${ctx.guildEntity.currency} \`${parseNumber(fine)}\`.`);
			} else {
				await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'CRIME_SUCCESS', amount, 0);
			}

			return new ExecutionNode()
				.setName('Heist!')
				.setDescription(`You committed a successful crime and "earned" ${ctx.guildEntity.currency} \`${parseNumber(amount)}\``);
		});
}
