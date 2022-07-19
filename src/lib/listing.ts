import { parseNumber } from '@adrastopoulos/number-parser';
import { parseEmoji } from 'discord.js';
import ms from 'ms';

import { Listing } from '../entities';
import { Context } from '../structures';
import { Emojis, ListingDescriptions } from '../typings';

const getFormattedCreateTimestamp = (listing: Listing): string => `<t:${Math.trunc(listing.createdAt.getTime() / 1000)}:f>`;
const getFormattedExpiresTimestamp = (listing: Listing): string => `${
	listing.duration === Infinity ? '`Never`' : `<t:${
		Math.trunc((listing.createdAt.getTime() + listing.duration) / 1000)
	}:R>`
}`;

export const displayListing = (ctx: Context, listing: Listing) => {
	const listingEmbed = ctx
		.embedify('info', 'user', `**Id**: \`${listing.id}\` | **Created:** ${getFormattedCreateTimestamp(listing)} | **Expires:** ${getFormattedExpiresTimestamp(listing)}`)
		.setAuthor({ name: `${listing.name} — ${listing.description}`, iconURL: ctx.client.emojis.resolve(parseEmoji(Emojis.BOX).id)?.url })
		.addFields([
			{ name: `${Emojis.MONEY_STACK} Price`, value: `${ctx.guildEntity.currency} \`${parseNumber(listing.price)}\``, inline: true },
			{ name: `${Emojis.MONEY_BAG} Required Treasury`, value: `${ctx.guildEntity.currency} \`${parseNumber(listing.treasuryRequired)}\``, inline: true },
			{ name: `${Emojis.BACKPACK} Items required`, value: listing.itemsRequired.length ? listing.itemsRequired.map((item) => `\`${item.name}\``).join('\n') : '`None`', inline: true },
			{ name: `${Emojis.STACK} Stackable`, value: `\`${listing.stackable}\``, inline: true },
			{ name: `${Emojis.TREND} Active`, value: `\`${listing.active}\``, inline: true },
			{ name: `${Emojis.TILES} In Stock`, value: `\`${listing.stock > 0}\``, inline: true },
			{ name: `${Emojis.KEY} Roles Required`, value: listing.rolesRequired.length ? listing.rolesRequired.map((role) => `<@&${role}>`).join('\n') : '`None`', inline: true },
			{ name: `${Emojis.RED_DOWN_ARROW} Roles Removed`, value: listing.rolesRemoved.length ? listing.rolesRemoved.map((role) => `<@&${role}>`).join('\n') : '`None`', inline: true },
			{ name: `${Emojis.GREEN_UP_ARROW} Roles Granted`, value: listing.rolesGranted.length ? listing.rolesGranted.map((role) => `<@&${role}>`).join('\n') : '`None`', inline: true },
			{ name: `${Emojis[listing.type]} \`${listing.type}\` Item`, value: `>>> ${ListingDescriptions[listing.type]}` },
		]);

	if (listing.type === 'GENERATOR') {
		listingEmbed.addFields([
			{ name: 'Generator Period', value: `\`${ms(listing.generatorPeriod)}\``, inline: true },
			{ name: 'Generator Amount', value: `${ctx.guildEntity.currency} \`${parseNumber(listing.generatorAmount)}\``, inline: true },
		]);
	}

	return listingEmbed;
};
