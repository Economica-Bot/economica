import { Item } from '../../entities/index.js';
import { recordTransaction } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('collect')
		.setDescription('Collect all money from generators.')
		.setModule('SHOP');

	public execute = async (ctx: Context) => {
		const items = await Item.find({ relations: ['listing'], where: { owner: ctx.memberEntity } });
		let amount = 0;
		items.forEach(async (item) => {
			if (item.listing.type !== 'GENERATOR') return;
			if (!(Date.now() - item.lastGeneratedAt.getTime() >= item.listing.generatorPeriod)) return;
			amount += item.listing.generatorAmount;
			await Item.update(Item, { lastGeneratedAt: new Date() });
		});

		if (amount) {
			await ctx.embedify('success', 'user', `Collected ${ctx.guildEntity.currency}${amount}`, false);
			await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.memberEntity, 'GENERATOR', 0, amount);
		} else {
			await ctx.embedify('warn', 'user', 'You have no money ready to collect', true);
		}
	};
}
