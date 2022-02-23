import { cut, transaction } from '../../lib/index.js';
import { Listing, ListingModel } from '../../models/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('sell')
		.setDescription('Sell an item')
		.setModule('SHOP')
		.setFormat('sell <item>')
		.setExamples(['sell Bike'])
		.addStringOption((option) => option.setName('item').setDescription('Specify an item.').setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const query = ctx.interaction.options.getString('item');
		const shop = await ListingModel.findOne({ name: new RegExp(`^${query}`, 'i') });
		const hasItem = ctx.memberDocument.inventory.some(async (inventoryItemDocument) => {
			const _member = await ctx.memberDocument
				.populate({ path: 'inventory.shop', model: 'Listing' })
				.execPopulate();
			const _shop = _member.inventory.find((item) => item._id === inventoryItemDocument._id).listing as Listing;
			return _shop._id === shop;
		});

		if (!shop) {
			return ctx.embedify('error', 'user', `No item with name \`${cut(query)}\` found (case-insensitive).`, true);
		} if (!hasItem) {
			return ctx.embedify('error', 'user', `No item with name \`${cut(query)}\` found in inventory (case-insensitive).`, true);
		}

		await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.clientDocument, 'SELL', shop.price * ctx.guildDocument.sellRefund, 0);
		ctx.memberDocument.inventory.forEach((entry, index, inventory) => {
			if (entry.amount === 1) return ctx.memberDocument.inventory.pull(entry);
			// eslint-disable-next-line no-param-reassign
			inventory[index].amount -= 1;
			return entry;
		});

		ctx.memberDocument.save();
		shop.stock += 1;
		shop.save();
		return ctx.embedify('success', 'user', `Sold \`${shop.name}\` for ${ctx.guildDocument.currency}${(shop.price * ctx.guildDocument.sellRefund).toLocaleString()}`, false);
	};
}
