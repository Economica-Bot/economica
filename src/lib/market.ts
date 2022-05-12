import { APIEmbedField, Util } from 'discord.js';

import { Market } from '../entities/index.js';
import { Context } from '../structures/index.js';
import { Emojis } from '../typings/constants.js';

const percentDifference = (num1: number, num2: number): string => (((num1 - num2) / num1) * 100).toFixed(2);

export const displayMarket = async (ctx: Context, market: Market): Promise<void> => {
	await ctx
		.embedify('info', 'user', `\`${market.amount}\` x **${market.listing.name}**\n**Sold By**: <@${market.owner.userId}>\n**Market Id:**: \`${market.id}\`\n**Listing Id**: \`${market.listing.id}\``)
		.setAuthor({ name: 'Market Item', iconURL: ctx.client.emojis.resolve(Util.parseEmoji(Emojis.GIVE).id)?.url })
		.addFields([
			{ name: `${Emojis.PRICE} Price`, value: `${ctx.guildEntity.currency}${market.price}`, inline: true },
			{ name: `${Emojis.CLASSIC} Original Price`, value: `${ctx.guildEntity.currency}${market.listing.price}`, inline: true },
			{ name: `${Emojis.ANALYTICS} % Difference`, value: `\`${percentDifference(market.price, market.listing.price)}\` Percent`, inline: true },
		])
		.send();
};

export const displayMarkets = async (ctx: Context, markets: Market[]): Promise<void> => {
	await ctx
		.embedify('info', 'user', `There are \`${markets.length}\` markets. Buy a market with \`/market buy <id>\`. View a specific market in more detail with \`/market view <id>\``)
		.addFields(markets.map((market) => ({ name: `${market.amount} x \`${market.listing.name}\` - ${ctx.guildEntity.currency}${market.price}`, value: `>>> **Id**: \`${market.id}\`\n**Seller**: <@${market.owner.userId}>\n**Listing Id:** \`${market.listing.id}\`` } as APIEmbedField)))
		.send();
};
