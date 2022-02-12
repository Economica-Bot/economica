import { GuildMemberRoleManager, Message } from 'discord.js';

import { getEconInfo, itemRegExp, transaction } from '../../lib';
import { MemberModel, ShopModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import { InventoryItem } from '../../typings';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('buy')
		.setDescription('Buy an item.')
		.setModule('SHOP')
		.addStringOption((option) => option.setName('item').setDescription('Specify an item.').setRequired(true));

	public execute = async (ctx: Context): Promise<Message> => {
		const query = ctx.interaction.options.getString('item');
		const item = await ShopModel.findOne({ guildId: ctx.interaction.guildId, name: itemRegExp(query), active: true });

		if (!item)
			return await ctx.embedify('error', 'user', `No item found with name ${query} (case-insensitive).`, true)
			
		const hasItem = ctx.memberDocument.inventory.some((i) => `${i.refId}` === `${item._id}`);

		const { currency } = ctx.guildDocument;
		const { wallet, treasury } = await getEconInfo(ctx.interaction.guildId, ctx.interaction.user.id);
		const missingRoles = new Array<String>();
		const missingItems = new Array<String>();
		const shop = await ShopModel.find({ guildId: ctx.interaction.guildId });

		item.requiredRoles.forEach(async (roleId) => {
			if (!(ctx.interaction.member.roles as GuildMemberRoleManager).cache.has(roleId)) {
				missingRoles.push(roleId);
			}
		});

		item.requiredItems.forEach(async (itemId) => {
			if (!ctx.memberDocument.inventory.some((entry) => entry.refId === itemId)) {
				missingItems.push(shop.find((item) => item._id === itemId).name);
			}
		});

		if (!item) {
			return await ctx.embedify('error', 'user', `No item with name \`${query}\` found (case-insensitive)`, true);
		} else if (item.price > wallet) {
			return await ctx.embedify('warn', 'user', `You cannot afford \`${query}\`.`, true);
		} else if (item.treasuryRequired > treasury) {
			return await ctx.embedify('warn', 'user', `You need ${currency}${item.treasuryRequired.toLocaleString()} in your treasury.`, true);
		} else if (missingItems.length) {
			return await ctx.embedify('warn', 'user', `You are missing \`${missingItems.join('`, `')}\`.`, true);
		} else if (missingRoles.length) {
			return await ctx.embedify('warn', 'user', `You are missing <@&${missingRoles.join('>, <@&')}>.`, true);
		} else if (hasItem && !item.stackable) {
			return await ctx.embedify('warn', 'user', `\`${query}\` is not stackable.`, true);
		}

		transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			ctx.client.user.id,
			'BUY',
			-item.price,
			0,
			-item.price
		);

		if (item.usability == 'Instant') {
			item.rolesGiven.forEach((roleId) => {
				(ctx.interaction.member.roles as GuildMemberRoleManager).add(roleId, `Purchased ${item.name}`);
			});
			item.rolesRemoved.forEach((roleId) => {
				(ctx.interaction.member.roles as GuildMemberRoleManager).remove(roleId, `Purchased ${item.name}`);
			})
		}

		const itemobj: InventoryItem = {
			refId: item._id,
			amount: 1,
			lastGenerateAt: item.type === 'GENERATOR' ? Date.now() : null,
			collected: item.type === 'GENERATOR' ? false : null,
		};

		if (hasItem) {
			// prettier-ignore
			MemberModel.findOneAndUpdate(
				{ 'inventory.amount': 1 }, 
				{ $inc: { 'inventory.$.amount': 1 } 
			});
		} else if (item.usability != 'Instant') { // If the item wasn't already used onBuy
			const itemobj: InventoryItem = {
				refId: item._id,
				amount: 1,
				lastGenerateAt: item.type === 'GENERATOR' ? Date.now() : null,
				collected: item.type === 'GENERATOR' ? false : null,
			};

			ctx.memberDocument.updateOne({ $push: { inventory: itemobj } });
		}

		item.updateOne({ $inc: { stock: -1 } });

		return await ctx.embedify(
			'success',
			'user',
			`Purchased \`${item.name}\` for ${currency}${item.price?.toLocaleString() || 0}`,
			false
		);
	};
}
