import ms from 'ms';

import { Listing } from '../models/index.js';
import { Context } from '../structures/index.js';

/**
 *
 * @param patt
 * @returns
 */
export const itemRegExp = (patt: string): RegExp => new RegExp(`^${patt}$`, 'i');

/**
 * Displays a listing
 * @param ctx - interaction context
 * @param listing - listing document
 */
export const displayListing = async (ctx: Context, listing: Listing): Promise<void> => {
	const expires = listing.duration === Number.POSITIVE_INFINITY ? 'Never' : `In ${ms(Date.now() + listing.duration)}`;
	const embed = ctx.embedify('info', 'user', `${listing.description}`)
		.setTitle(`${listing.name} ${listing.active ? '' : '<:ITEM_DISABLED:944737714274717746>'}`)
		.setFields([
			{ name: 'Type', value: `\`${listing.type}\``, inline: false },
			{ name: 'Active?', value: `\`${listing.active}\``, inline: true },
			{ name: 'Stackable?', value: `\`${listing.stackable}\``, inline: true },
			{ name: 'Price', value: `${ctx.guildDocument.currency}${listing.price?.toLocaleString() || 'Free'}`, inline: true },
			{ name: 'Required Treasury', value: `${ctx.guildDocument.currency}${listing.treasuryRequired.toLocaleString()}+`, inline: true },
			{ name: 'Expires', value: `${expires}`, inline: true },
			{ name: 'Stock Left', value: `${listing.stock.toLocaleString()}`, inline: true },
			{ name: 'Roles Given', value: listing.rolesGiven.length ? `<@&${listing.rolesGiven.join('>, <@&')}>` : 'None', inline: true },
			{ name: 'Roles Removed', value: listing.rolesRemoved.length ? `<@&${listing.rolesRemoved.join('>, <@&')}>` : 'None', inline: true },
			{ name: 'Required Roles', value: listing.requiredRoles.length ? `<@&${listing.requiredRoles.join('>, <@&')}>` : 'None', inline: true },
			{ name: 'Required Items', value: listing.requiredItems.length ? `\`${listing.requiredItems.join('`, `')}\`` : 'None', inline: true },
		]);

	if (listing.type === 'GENERATOR') {
		embed.addFields([
			{ name: 'Generator', value: `Generates ${ctx.guildDocument.currency}${listing.generatorAmount} every ${ms(listing.generatorPeriod)}` },
		]);
	}

	return ctx.interaction.reply({ embeds: [embed] });
};

// export const displayInventoryItem = async (ctx: Context, inventoryItem: InventoryItem): Promise<void> => {

// };
