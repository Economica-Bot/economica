import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { MessageComponentInteraction, parseEmoji } from 'discord.js';
import ms from 'ms';
import { ILike } from 'typeorm';

import { Listing } from '../entities/index.js';
import { Context } from '../structures/index.js';
import { Emojis } from '../typings/constants.js';
import { ListingDescriptions, ListingString } from '../typings/index.js';
import { collectProp } from './util.js';

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

export const displayListings = async (ctx: Context, listings: Listing[]) => {
	const description = `${Emojis.MENU} **There are \`${listings.length}\` active listings.**\n\n${Emojis.COLLECTABLE} **Use \`/buy <item>\` to buy an item, and \`/shop <item>\` for more information on a specific item.**`;
	const listingsEmbed = ctx.embedify('info', 'user', description);
	listings.forEach((listing) => {
		listingsEmbed.addFields([
			{ name: `${listing.name} - ${ctx.guildEntity.currency}${listing.price}`, value: `>>> ${listing.description}\n**Id:** \`${listing.id}\`` },
		]);
	});

	await ctx.interaction.reply({ embeds: [listingsEmbed] });
};

export const editListing = async (ctx: Context, interaction: MessageComponentInteraction<'cached'>, listing: Listing, skipAll = false) => {
	const embed = ctx
		.embedify('info', 'user')
		.setAuthor({ name: 'Shop Item Creation Menu' })
		.setThumbnail(ctx.client.emojis.resolve(parseEmoji(Emojis.CHEST).id).url);

	listing.name = await collectProp(ctx, interaction, embed, 'name', (msg) => !!msg.content, (msg) => msg.content, skipAll) ?? listing.name;
	listing.price = await collectProp(ctx, interaction, embed, 'price', (msg) => !!parseString(msg.content), (msg) => parseString(msg.content), skipAll) ?? listing.price;
	listing.type = await collectProp(ctx, interaction, embed, 'type', (msg) => ['collectable', 'instant', 'usable', 'generator'].includes(msg.content.toLowerCase()), (msg) => msg.content.toUpperCase(), skipAll) as ListingString ?? listing.type;
	listing.treasuryRequired = await collectProp(ctx, interaction, embed, 'required treasury', (msg) => !!parseString(msg.content), (msg) => parseString(msg.content), true) ?? listing.treasuryRequired ?? 0;
	listing.description = await collectProp(ctx, interaction, embed, 'description', (msg) => !!msg.content, (msg) => msg.content, true) ?? listing.description ?? 'No description';
	listing.duration = await collectProp(ctx, interaction, embed, 'duration', (msg) => !!ms(msg.content), (msg) => ms(msg.content), true) ?? listing.duration ?? Infinity;
	listing.stock = await collectProp(ctx, interaction, embed, 'stock', (msg) => !!parseString(msg.content), (msg) => parseString(msg.content), true) ?? listing.stock ?? Infinity;
	listing.stackable = await collectProp(ctx, interaction, embed, 'stackable', (msg) => ['false', 'true'].includes(msg.content.toLowerCase()), (msg) => msg.content === 'true', true) ?? listing.stackable ?? false;
	listing.itemsRequired = await collectProp(ctx, interaction, embed, 'required items', async (msg) => !!(await Listing.findBy({ guild: { id: ctx.interaction.guildId }, name: ILike(msg.content) })).length, async (msg) => Listing.findBy({ guild: { id: ctx.interaction.guildId }, name: ILike(msg.content) }), true) ?? listing.itemsRequired ?? [];
	listing.rolesRequired = await collectProp(ctx, interaction, embed, 'required roles', (msg) => !!msg.mentions.roles.size, (msg) => Array.from(msg.mentions.roles.values()).map((role) => role.id), true) ?? listing.rolesRequired ?? [];
	listing.rolesGranted = await collectProp(ctx, interaction, embed, 'granted roles', (msg) => !!msg.mentions.roles.size, (msg) => Array.from(msg.mentions.roles.values()).map((role) => role.id), true) ?? listing.rolesGranted ?? [];
	listing.rolesRemoved = await collectProp(ctx, interaction, embed, 'removed roles', (msg) => !!msg.mentions.roles.size, (msg) => Array.from(msg.mentions.roles.values()).map((role) => role.id), true) ?? listing.rolesGranted ?? [];
	if (listing.type === 'GENERATOR') {
		listing.generatorAmount = await collectProp(ctx, interaction, embed, 'generator amount', (msg) => !!parseString(msg.content), (msg) => parseString(msg.content)) ?? listing.generatorAmount;
		listing.generatorPeriod = await collectProp(ctx, interaction, embed, 'generator period', (msg) => !!ms(msg.content), (msg) => ms(msg.content)) ?? listing.generatorPeriod;
	}
};
