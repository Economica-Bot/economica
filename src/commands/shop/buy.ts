import { GuildMemberRoleManager } from 'discord.js';

import { getEconInfo, transaction } from '../../lib';
import { MemberModel, ShopModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import { InventoryItem } from '../../typings';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('buy')
		.setDescription('Buy an item.')
		.setGroup('SHOP')
		.addStringOption((option) => option.setName('item').setDescription('Specify an item.').setRequired(true));

	execute = async (ctx: Context) => {
		const query = ctx.interaction.options.getString('item');
		const item = await ShopModel.findOne({ guildId: ctx.interaction.guildId, name: query, active: true });
		const hasItem = ctx.memberDocument.inventory.some((i) => i.name === item.name);
		const { currency } = ctx.guildDocument;
		const { wallet, treasury } = await getEconInfo(ctx.interaction.guildId, ctx.interaction.user.id);

		if (!item) return await ctx.embedify('error', 'user', 'Could not find an item with that name.');
		if (item.price > wallet) return await ctx.embedify('warn', 'user', 'You cannot afford this item.');
		if (item.treasuryRequired > treasury)
			return await ctx.embedify('warn', 'user', `You need ${currency}${item.treasuryRequired.toLocaleString()}`);

		item.rolesRequired.forEach(async (roleId) => {
			if (!(ctx.interaction.member.roles as GuildMemberRoleManager).cache.has(roleId)) {
				return await ctx.embedify('warn', 'user', `You are missing <@&${roleId}>.`);
			}
		});

		item.rolesRemoved.forEach(async (roleId) => {
			(ctx.interaction.member.roles as GuildMemberRoleManager).remove(roleId);
		});

		item.itemsRequired.forEach(async (item) => {
			if (!ctx.memberDocument.inventory.some((entry) => entry.name === item)) {
				return await ctx.embedify('warn', 'user', `You are missing prerequisite item \`${item}\`.`);
			}
		});

		if (hasItem && !item.stackable) {
			return await ctx.embedify('warn', 'user', 'This item is not stackable.');
		}

		await transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			ctx.client.user.id,
			'BUY',
			-item.price,
			0,
			-item.price
		);

		item.rolesGiven.forEach((roleId) => {
			(ctx.interaction.member.roles as GuildMemberRoleManager).add(roleId, `Purchased ${item.name}`);
		});

		const itemobj: InventoryItem = {
			name: item.name,
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
		} else {
			ctx.memberDocument.updateOne({ $push: { inventory: itemobj } });
		}

		item.updateOne({ $inc: { stock: -1 } });

		return await ctx.embedify(
			'success',
			'user',
			`Purchased \`${item.name}\` for ${currency}${item.price.toLocaleString()}`
		);
	};
}
