import { parseNumber } from '@adrastopoulos/number-parser';

import { Item } from '../../entities';
import { recordTransaction } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('collect')
		.setDescription('Collect all money from generators.')
		.setModule('SHOP')
		.setFormat('collect')
		.setExamples(['collect']);

	public execution = new Router()
		.get('', async (ctx) => {
			const items = await Item.find({
				relations: ['listing'],
				where: {
					owner: { userId: ctx.memberEntity.userId, guildId: ctx.memberEntity.guildId },
					listing: { type: 'GENERATOR' },
				},
			});
			let amount = 0;
			items.forEach(async (item) => {
				const lastGeneratedAt = item.lastGeneratedAt?.getTime() ?? 0;
				if (!(Date.now() - lastGeneratedAt >= item.listing.generatorPeriod)) return;
				amount += item.listing.generatorAmount;
				// eslint-disable-next-line no-param-reassign
				item.lastGeneratedAt = new Date();
				await item.save();
			});

			let result: string;
			if (amount) {
				result = `${Emojis.CHECK} Collected ${ctx.guildEntity.currency}${parseNumber(amount)}`;
				await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.memberEntity, 'GENERATOR', 0, amount);
			} else {
				result = 'You have **no money ready** to collect.'
					+ `\n${items.map((item) => `**${item.listing.name}** - ${ctx.guildEntity.currency} \`${parseNumber(item.listing.generatorAmount)} | **Ready:** <t:${Math.trunc(
						(item.lastGeneratedAt.getTime() + item.listing.generatorPeriod) / 1000,
					)}:R>`)}`;
			}

			return new ExecutionNode()
				.setName('Collecting Generator Funds...')
				.setDescription(result);
		});
}
