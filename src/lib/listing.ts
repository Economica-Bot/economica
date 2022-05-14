import { parseNumber } from '@adrastopoulos/number-parser';
import { Util } from 'discord.js';
import ms from 'ms';

import { Listing } from '../entities/index.js';
import { Context } from '../structures/index.js';
import { Emojis } from '../typings/constants.js';
import { ListingDescriptions } from '../typings/index.js';

const getFormattedCreateTimestamp = (listing: Listing): string => `<t:${Math.trunc(listing.createdAt.getTime() / 1000)}:f>`;
const getFormattedExpiresTimestamp = (listing: Listing): string => `${
	listing.duration === Infinity ? '`Never`' : `<t:${
		Math.trunc((listing.createdAt.getTime() + listing.duration) / 1000)
	}:R>`
}`;

export const displayListing = async (ctx: Context, listing: Listing): Promise<void> => {
	const listingEmbed = ctx
		.embedify('info', 'user', `**Id**: \`${listing.id}\` | **Created:** ${getFormattedCreateTimestamp(listing)} | **Expires:** ${getFormattedExpiresTimestamp(listing)}`)
		.setAuthor({ name: `${listing.name} — ${listing.description}`, iconURL: ctx.client.emojis.resolve(Util.parseEmoji(Emojis.BOX).id)?.url })
		.addFields([
			{ name: `${Emojis.MONEY_STACK} Price`, value: `${ctx.guildEntity.currency}${listing.price}`, inline: true },
			{ name: `${Emojis.MONEY_BAG} Required Treasury`, value: `${ctx.guildEntity.currency}${listing.treasuryRequired}`, inline: true },
			{ name: `${Emojis.BACKPACK} Items required`, value: listing.itemsRequired?.map((item) => `\`${item.id}\``).join('\n') ?? '`None`', inline: true },
			{ name: `${Emojis.STACK} Stackable`, value: `\`${listing.stackable}\``, inline: true },
			{ name: `${Emojis.TREND} Active`, value: `\`${listing.stackable}\``, inline: true },
			{ name: `${Emojis.TILES} In Stock`, value: `\`${listing.stock > 0}\``, inline: true },
			{ name: `${Emojis.KEY} Roles Required`, value: listing.rolesRequired.length ? listing.rolesRequired.map((role) => `<@&${role}>`).join('\n') : '`None`', inline: true },
			{ name: `${Emojis.GREEN_UP_ARROW} Roles Removed`, value: listing.rolesRemoved.length ? listing.rolesRemoved.map((role) => `<@&${role}>`).join('\n') : '`None`', inline: true },
			{ name: `${Emojis.RED_DOWN_ARROW} Roles Given`, value: listing.rolesGiven.length ? listing.rolesGiven.map((role) => `<@&${role}>`).join('\n') : '`None`', inline: true },
			{ name: `${Emojis[listing.type]} \`${listing.type}\` Item`, value: `${ListingDescriptions[listing.type]}` },
		]);

	if (listing.type === 'GENERATOR') {
		listingEmbed.addFields([
			{ name: 'Generator Period', value: `\`${ms(listing.generatorPeriod)}\``, inline: true },
			{ name: 'Generator Amount', value: `${ctx.guildEntity.currency}${parseNumber(listing.generatorAmount)}`, inline: true },
		]);
	}

	await ctx.interaction.reply({ embeds: [listingEmbed] });
};

export const displayListings = async (ctx: Context, listings: Listing[]) => {
	const description = `${Emojis.MENU} **There are \`${listings.length}\` active listings.**\n\n${Emojis.LEATHER_BOOK} **Use \`/buy <item>\` to buy an item, and \`/shop <item>\` for more information on a specific item.**`;
	const listingsEmbed = ctx.embedify('info', 'user', description);
	listings.forEach((listing) => {
		listingsEmbed.addFields([
			{ name: `${listing.name} - ${ctx.guildEntity.currency}${listing.price}`, value: `>>> ${listing.description}\n**Id:** \`${listing.id}\`` },
		]);
	});

	await ctx.interaction.reply({ embeds: [listingsEmbed] });
};
