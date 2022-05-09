import { Util } from 'discord.js';

import { Listing } from '../entities/index.js';
import { Context } from '../structures/index.js';
import { Emojis } from '../typings/constants.js';
import { ListingDescriptions, ListingEmojis } from '../typings/index.js';

export const displayListing = async (ctx: Context, listing: Listing): Promise<void> => {
	const listingEmbed = ctx
		.embedify('info', 'user', `**Created At**: \`${listing.createdAt.toLocaleString()}\`\n**Expires**: \`${new Date(listing.createdAt.getTime() + listing.duration).toLocaleString()}\``)
		.setAuthor({ name: listing.name, iconURL: ctx.client.emojis.resolve(Util.parseEmoji(Emojis.SHOP).id)?.url })
		.addFields([
			{ name: 'Type', value: `${ListingEmojis[listing.type]} \`${listing.type}\` - **${ListingDescriptions[listing.type]}**` },
			{ name: 'Price', value: `${ctx.guildEntity.currency}${listing.price}`, inline: true },
			{ name: 'Required Treasury', value: `${ctx.guildEntity.currency}${listing.treasuryRequired}`, inline: true },
			{ name: '‎', value: '‎', inline: true },
			{ name: `${Emojis.DESCRIPTION} Description`, value: `**${listing.description}**` },
			{ name: `${Emojis.STACK} Stackable`, value: `\`${listing.stackable}\``, inline: true },
			{ name: `${Emojis.ANALYTICS} Active`, value: `\`${listing.stackable}\``, inline: true },
			{ name: `${Emojis.STOCK} In Stock`, value: `\`${listing.stock > 0}\``, inline: true },
			{ name: `${Emojis.INSUFFICIENT} Items required`, value: listing.itemsRequired?.map((item) => `\`${item.id}\``).join('\n') ?? 'None' },
			{ name: `${Emojis.ROLE} Roles`, value: '**Shop listings may require roles to purchase, remove roles upon purchasing, or grant roles when purchased. This is useful for tracking which items you have at a glance.**' },
			{ name: `${Emojis.KEY} Required`, value: listing.rolesRequired.length ? listing.rolesRequired.map((role) => `<@&${role}>`).join('\n') : 'None', inline: true },
			{ name: `${Emojis.REMOVE} Removed`, value: listing.rolesRemoved.length ? listing.rolesRemoved.map((role) => `<@&${role}>`).join('\n') : 'None', inline: true },
			{ name: `${Emojis.GIVE} Given`, value: listing.rolesGiven.length ? listing.rolesGiven.map((role) => `<@&${role}>`).join('\n') : 'None', inline: true },
		]);

	if (listing.type === 'GENERATOR') {
		listingEmbed.addFields([
			{ name: 'Generator Period', value: listing.generatorPeriod.toLocaleString(), inline: true },
			{ name: 'Generator Amount', value: listing.generatorAmount.toLocaleString(), inline: true },
		]);
	}

	await ctx.interaction.reply({ embeds: [listingEmbed] });
};

export const displayListings = async (ctx: Context, listings: Listing[]) => {
	const listingsEmbed = ctx.embedify('info', 'user', `There are \`${listings.length}\` listings in the shop.`);
	listings.forEach((listing) => {
		listingsEmbed.addFields([
			{ name: `${listing.name} - ${ctx.guildEntity.currency}${listing.price}`, value: `*${listing.description}*\n\`${listing.id}\`` },
		]);
	});

	await ctx.interaction.reply({ embeds: [listingsEmbed] });
};
