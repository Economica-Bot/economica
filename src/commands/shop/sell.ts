import { GuildMemberRoleManager } from 'discord.js';

import { transaction } from '../../lib';
import { Shop, ShopModel } from '../../models';
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
		const hasItem = ctx.memberDocument.inventory.some((inventoryItemDocument) => {
			const _shop = inventoryItemDocument.populate('shop').shop as Shop;
			return _shop._id === shop;
		});

		const { currency } = ctx.guildDocument;

		if (!shop) {
			return await ctx.embedify('error', 'user', 'Could not find an item with that name.', true);
		} else if (!hasItem) {
			return await ctx.embedify('warn', 'user', 'You do not have this item.', true);
		}

		await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.clientDocument, 'SELL', shop.price, 0);

		shop.rolesGiven.forEach((roleId) => {
			(ctx.interaction.member.roles as GuildMemberRoleManager).remove(roleId, `Sold ${shop.name}`);
		});

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
			`Sold \`${shop.name}\` for ${currency}${shop.price.toLocaleString()}`,
			false
		);
	};
}
