import { parseNumber } from '@adrastopoulos/number-parser';
import { APIEmbedField } from 'discord.js';
import { Item } from '../../entities/index.js';
import { recordTransaction } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { Emojis } from '../../typings/constants.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('collect')
		.setDescription('Collect all money from generators.')
		.setModule('SHOP')
		.setFormat('collect')
		.setExamples(['collect']);

	public execute = async (ctx: Context) => {
		const items = await Item.find({ relations: ['listing'], where: { owner: { userId: ctx.memberEntity.userId, guildId: ctx.memberEntity.guildId }, listing: { type: 'GENERATOR' } } });
		let amount = 0;
		items.forEach(async (item) => {
			const lastGeneratedAt = item.lastGeneratedAt?.getTime() ?? 0;
			if (!(Date.now() - lastGeneratedAt >= item.listing.generatorPeriod)) return;
			amount += item.listing.generatorAmount;
			// eslint-disable-next-line no-param-reassign
			item.lastGeneratedAt = new Date();
			await item.save();
		});

		if (amount) {
			await ctx.embedify('success', 'user', `${Emojis.GENERATOR} Collected ${ctx.guildEntity.currency}${parseNumber(amount)}`).send();
			await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.memberEntity, 'GENERATOR', 0, amount);
		} else {
			await ctx
				.embedify('warn', 'user', 'You have **no money ready** to collect.')
				.addFields(items.map((item) => ({ name: `\`${item.listing.name}\``, value: `**Ready:** <t:${Math.trunc((item.lastGeneratedAt.getTime() + item.listing.generatorPeriod) / 1000)}:R>` } as APIEmbedField)))
				.send(true);
		}
	};
}
