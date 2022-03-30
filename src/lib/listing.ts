import { parseNumber } from '@adrastopoulos/number-parser';
import ms from 'ms';
import { Listing } from '../entities/index.js';

import { Context, ContextEmbed } from '../structures/index.js';

/**
 * Displays a listing
 * @param ctx - interaction context
 * @param listing - listing document
 */
export const displayListing = async (ctx: Context, listing: Listing): Promise<ContextEmbed> => {
	const embed = ctx.embedify('info', 'user', `${listing.description}`)
		.setTitle(`${listing.name} ${listing.active ? '' : '<:ITEM_DISABLED:944737714274717746>'}`)
		.setFields(
			{ name: 'Type', value: `\`${listing.type}\``, inline: false },
			{ name: 'Active?', value: `\`${listing.active}\``, inline: true },
			{ name: 'Stackable?', value: `\`${listing.stackable}\``, inline: true },
			{ name: 'Price', value: `${ctx.guildEntity.currency}${parseNumber(listing.price) || 'Free'}`, inline: true },
			{ name: 'Required Treasury', value: `${ctx.guildEntity.currency}${parseNumber(listing.treasuryRequired)}+`, inline: true },
			{ name: 'Expires', value: `${listing.expiresAt}`, inline: true },
			{ name: 'Stock Left', value: `${parseNumber(listing.stock)}`, inline: true },
			{ name: 'Roles Given', value: listing.rolesGiven.length ? `<@&${listing.rolesGiven.join('>, <@&')}>` : 'None', inline: true },
			{ name: 'Roles Removed', value: listing.rolesRemoved.length ? `<@&${listing.rolesRemoved.join('>, <@&')}>` : 'None', inline: true },
			{ name: 'Required Roles', value: (await listing.itemsRequired).length ? `<@&${listing.rolesRequired.join('>, <@&')}>` : 'None', inline: true },
			{ name: 'Required Items', value: (await listing.itemsRequired).length ? `\`${(await listing.itemsRequired).map((item) => item.name).join('`, `')}\`` : 'None', inline: true },
		);

	if (listing.type === 'GENERATOR') {
		embed.addFields(
			{ name: 'Generator', value: `Generates ${ctx.guildEntity.currency}${listing.generatorAmount} every ${ms(listing.generatorPeriod)}` },
		);
	}

	return embed;
};
