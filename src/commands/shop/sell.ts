import { GuildMemberRoleManager } from 'discord.js';

import { transaction, asyncSome, cut } from '../../lib';
import { ShopModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('sell')
		.setDescription('Sell an item.')
		.setModule('SHOP')
		.addStringOption((option) => option.setName('item').setDescription('Specify an item.').setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const query = ctx.interaction.options.getString('item');
		const shop = await ShopModel.findOne({ name: new RegExp(`^${query}`, 'i') });
		const hasItem = await asyncSome(ctx.memberDocument.inventory, (async (invItem) => {
			ctx.memberDocument = await ctx.memberDocument.populate({
				path: `inventory.shop`,
				model: 'Shop'
			}).execPopulate()

			const inventoryItem = ctx.memberDocument.inventory.find(i => {
				return `${i.shop._id}` == `${shop._id}`
			})

			if (inventoryItem) {
				return true
			}
			else return false
		}));

		const { currency } = ctx.guildDocument;

		if (!shop) {
			return await ctx.embedify('error', 'user', `No item with name \`${cut(query)}\` found (case-insensitive).`, true);
		} else if (!hasItem) {
			return await ctx.embedify('error', 'user', `No item with name \`${cut(query)}\` found in inventory (case-insensitive).`, true);
		}

		await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.clientDocument, 'SELL', (shop.price * ctx.guildDocument.sellRefund), 0);

		ctx.memberDocument.inventory.map((entry) => {
			if (entry.amount === 1) {
				return ctx.memberDocument.inventory.pull(entry);
			} else {
				entry.amount -= 1;
				return entry;
			}
		});

		ctx.memberDocument.save();
		shop.stock += 1;
		shop.save();

		return await ctx.embedify(
			'success',
			'user',
			`Sold \`${shop.name}\` for ${currency}${(shop.price * ctx.guildDocument.sellRefund).toLocaleString()}`,
			false
		);
	};
}
