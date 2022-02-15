import { GuildMemberRoleManager } from 'discord.js';

import { getEconInfo, transaction } from '../../lib';
import { Shop, ShopModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('buy')
		.setDescription('Buy an item.')
		.setModule('SHOP')
		.addStringOption((option) => option.setName('name').setDescription('Specify the name.').setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const query = ctx.interaction.options.getString('item');
		const shop = await ShopModel.findOne({ name: new RegExp(`^${query}`, 'i') });
		const hasItem = ctx.memberDocument.inventory.some((inventoryItemDocument) => {
			const _shop = inventoryItemDocument.populate('shop').shop as Shop;
			return _shop._id === shop;
		});

		const { currency } = ctx.guildDocument;
		const { wallet, treasury } = await getEconInfo(ctx.memberDocument);
		const missingRoles = new Array<String>();
		const missingItems = new Array<String>();

		shop.requiredRoles.forEach(async (roleId) => {
			if (!(ctx.interaction.member.roles as GuildMemberRoleManager).cache.has(roleId)) {
				missingRoles.push(roleId);
			}
		});

		shop
			.populate('requiredItems')
			.execPopulate()
			.then((shop) => {
				shop.requiredItems.forEach(async (shop: Shop) => {
					if (!ctx.memberDocument.inventory.some((entry) => entry.shop._id === shop._id)) {
						missingItems.push(shop.name);
					}
				});
			});

		if (!shop) {
			return await ctx.embedify('error', 'user', 'Could not find an item with that name.', true);
		} else if (shop.price > wallet) {
			return await ctx.embedify('warn', 'user', 'You cannot afford this item.', true);
		} else if (shop.treasuryRequired > treasury) {
			// prettier-ignore
			return await ctx.embedify('warn', 'user', `You need ${currency}${shop.treasuryRequired.toLocaleString()} in your treasury.`, true);
		} else if (missingItems.length) {
			return await ctx.embedify('warn', 'user', `You are missing \`${missingItems.join('`, `')}\`.`, true);
		} else if (missingRoles.length) {
			return await ctx.embedify('warn', 'user', `You are missing <@&${missingRoles.join('>, <@&')}>.`, true);
		} else if (hasItem && !shop.stackable) {
			return await ctx.embedify('warn', 'user', 'This item is not stackable.', true);
		}

		shop.rolesRemoved.forEach(async (roleId) => {
			(ctx.interaction.member.roles as GuildMemberRoleManager).remove(roleId, `Purchased ${shop.name}`);
		});

		shop.rolesGiven.forEach((roleId) => {
			(ctx.interaction.member.roles as GuildMemberRoleManager).add(roleId, `Purchased ${shop.name}`);
		});

		await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.clientDocument, 'BUY', -shop.price, 0);

		if (hasItem) {
			// prettier-ignore
			ctx.memberDocument.inventory.find((v) => v.shop === shop._id).amount += 1;
			ctx.memberDocument.markModified('inventory');
		} else {
			ctx.memberDocument.inventory.push({ shop, amount: 1 });
		}

		await ctx.memberDocument.save();
		shop.stock -= 1;
		shop.save();
		return await ctx.embedify(
			'success',
			'user',
			`Purchased \`${shop.name}\` for ${currency}${shop.price.toLocaleString()}`,
			false
		);
	};
}
