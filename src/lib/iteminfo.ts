import { MessageEmbed } from 'discord.js';
import { Context } from '../structures';
import { Shop, ShopModel } from '../models'
import ms from 'ms';
import { Document } from 'mongoose';

/**
 * Returns an embed displaying info on an item.
 * @param ctx - Context of the parent interaction.
 * @param item - A single ShopModel query. Not an InventoryItem type.
 * @returns {MessageEmbed} embed
 */
export const itemInfo = async (ctx: Context, item: Shop & Document<any, any, Shop>): Promise<MessageEmbed> => {
	const shop = await ShopModel.find({
		guildId: ctx.interaction.guildId
	})
	const requiredInventoryItems: any[] = [];

	item.requiredItems?.forEach(async (itemId: any) => {
		const reqItem = shop.find(i => `${i._id}` == `${itemId}`)
		requiredInventoryItems.push(reqItem.name)
	})
	const embed = ctx.embedify('info', 'user', `${item.description}`)
		.setTitle(item.name)
		// Global fields
		.setFields([
			{ name: 'Type', value: `\`${item.type}\``, inline: false },
			{ name: 'Active?', value: `\`${item.active}\``, inline: true },
			{ name: 'Stackable?', value: `\`${item.stackable}\``, inline: true },
			{ name: 'Usability', value: `${item.usability}`, inline: true },
			{ name: 'Price', value: `${ctx.guildDocument.currency}${item.price.toLocaleString() || 'Free'}`, inline: true },
			{ name: 'Required Treasury', value: `${ctx.guildDocument.currency}${item.treasuryRequired.toLocaleString()}+`, inline: true },
			{ name: 'Shop Duration Left', value: `${item.duration != Number.POSITIVE_INFINITY && item.active ? ms((item.createdAt.getTime() + item.duration) - Date.now()) : 'Infinite'}`, inline: true },
			{ name: 'Stock Left', value: `${item.stock.toLocaleString()}`, inline: true },
			{ name: 'Roles Given', value: item.rolesGiven.length ? `<@&${item.rolesGiven.join('>, <@&')}>` : 'None', inline: true },
			{ name: 'Roles Removed', value: item.rolesRemoved.length ? `<@&${item.rolesRemoved.join('>, <@&')}>` : 'None', inline: true },
			{ name: 'Required Roles', value: item.requiredRoles.length ? `<@&${item.requiredRoles.join('>, <@&')}>` : 'None', inline: true },
			{ name: 'Required Inventory Items', value: requiredInventoryItems.length ? `\`${requiredInventoryItems.join('`, `')}\`` : 'None', inline: true }
		]);

	if (item.type === 'GENERATOR')
		embed.addFields([
			{ name: 'Generator', value: `Generates ${ctx.guildDocument.currency}${item.generatorAmount} every ${ms(item.generatorPeriod)}` }
		])

	return embed;
}