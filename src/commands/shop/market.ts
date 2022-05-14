import { parseString } from '@adrastopoulos/number-parser';

import { Item, Market } from '../../entities/index.js';
import { displayMarket, displayMarkets, recordTransaction } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { Emojis } from '../../typings/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('market')
		.setModule('SHOP')
		.setDescription('Buy and sell items to other users')
		.setFormat('market <view | buy | sell | cancel> [...args]')
		.setExamples([
			'market sell boat @Adrastopoulos 100',
			'market sell car @Adrastopoulos 250 2',
			'market buy 788545260405129237',
		])
		.addSubcommand((subcommand) => subcommand
			.setName('view')
			.setDescription('View active markets')
			.addStringOption((option) => option
				.setName('market_id')
				.setDescription('Specify the market id')))
		.addSubcommand((subcommand) => subcommand
			.setName('buy')
			.setDescription('Buy items from another user')
			.addStringOption((option) => option.setName('market_id').setDescription('Specify the id of the market').setRequired(true)))
		.addSubcommand((subcommand) => subcommand
			.setName('sell')
			.setDescription('Sell items to another user')
			.addStringOption((option) => option.setName('item_id').setDescription('Specify the id of the item').setRequired(true))
			.addStringOption((option) => option.setName('price').setDescription('Specify the price of the sale').setRequired(true))
			.addIntegerOption((option) => option.setName('amount').setDescription('Specify the amount of items to sell').setMinValue(1)))
		.addSubcommand((subcommand) => subcommand
			.setName('remove')
			.setDescription('Remove a market')
			.addStringOption((option) => option
				.setName('market_id')
				.setDescription('Specify the id of the market')
				.setRequired(true)));

	public execute = async (ctx: Context) => {
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const id = ctx.interaction.options.getString('market_id');
			if (!id) {
				const markets = await Market.find({ relations: ['owner', 'listing', 'listing.guild'], where: { listing: { guild: { id: ctx.interaction.guildId } } } });
				await displayMarkets(ctx, markets);
				return;
			}

			const market = await Market.findOne({ relations: ['owner', 'listing', 'listing.guild'], where: { listing: { guild: { id: ctx.interaction.guildId } }, id } });
			if (!market) {
				await ctx.embedify('error', 'user', `Could not find a market with id \`${id}\``).send();
				return;
			}

			await displayMarket(ctx, market);
		} else if (subcommand === 'buy') {
			const id = ctx.interaction.options.getString('market_id');

			const market = await Market.findOne({ relations: ['owner', 'listing', 'listing.guild'], where: { listing: { guild: { id: ctx.interaction.guildId } }, id } });
			const item = await Item.findOneBy({ owner: { guildId: ctx.interaction.guildId, userId: ctx.interaction.user.id }, listing: { id: market?.listing?.id } });

			if (!market) await ctx.embedify('error', 'user', `Could not find market with id \`${id}\`.`).send();
			else if (market.owner.guildId === ctx.memberEntity.guildId && market.owner.userId === ctx.memberEntity.userId) await ctx.embedify('error', 'user', 'You cannot buy your own market.').send();
			else if (item && !market.listing.stackable) await ctx.embedify('error', 'user', 'You cannot have more than one of this item.').send();
			else if (market.price > ctx.memberEntity.wallet) await ctx.embedify('error', 'user', 'You cannot afford to purchase this market.').send();
			if (ctx.interaction.replied) return;

			await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, market.owner, 'BUY', -market.price, 0);
			await recordTransaction(ctx.client, ctx.guildEntity, market.owner, ctx.memberEntity, 'SELL', 0, market.price);

			await market.remove();
			if (item) {
				item.amount += market.amount;
			} else {
				await Item.create({ listing: market.listing, owner: ctx.memberEntity, amount: market.amount }).save();
			}

			await ctx.embedify('success', 'user', `${Emojis.CHECK} **Market Purchased Successfully**`).send();
		} else if (subcommand === 'sell') {
			const id = ctx.interaction.options.getString('item_id');
			const price = ctx.interaction.options.getString('price');
			const amount = ctx.interaction.options.getInteger('amount') ?? 1;

			const item = await Item.findOne({ relations: ['listing'], where: { owner: { guildId: ctx.guildEntity.id, userId: ctx.userEntity.id }, id } });

			if (!item) await ctx.embedify('error', 'user', `Could not find item with Id \`${id}\`.`).send();
			else if (amount > item.amount) await ctx.embedify('error', 'user', `You do not have \`${amount}\` of that item.`).send();
			else if (!parseString(price)) await ctx.embedify('error', 'user', `Could not parse price \`${price}\`.`).send();
			else if (parseString(price) < 0) await ctx.embedify('error', 'user', 'Price must be greater than or equal to zero.').send();
			if (ctx.interaction.replied) return;

			item.amount -= amount;
			if (item.amount === 0) await item.remove();
			else await item.save();

			await Market.create({
				listing: item.listing,
				owner: ctx.memberEntity,
				price: parseString(price),
				amount,
			}).save();

			await ctx.embedify('success', 'user', `${Emojis.CHECK} **Market Created Successfully**`).send();
		} else if (subcommand === 'remove') {
			const id = ctx.interaction.options.getString('market_id');
			const market = await Market.findOne({ relations: ['listing'], where: { owner: { guildId: ctx.guildEntity.id, userId: ctx.userEntity.id }, id } });
			const item = await Item.findOneBy({ owner: { guildId: ctx.interaction.guildId, userId: ctx.interaction.user.id }, listing: { id: market?.listing?.id } });

			if (!market) await ctx.embedify('error', 'user', `Could not find market with id \`${id}\`.`).send();
			else if (item && !market.listing.stackable) await ctx.embedify('error', 'user', 'This item is in your inventory, and it is not stackable.').send();
			if (ctx.interaction.replied) return;

			if (item) {
				item.amount += market.amount;
				await item.save();
			} else {
				await Item.create({
					listing: market.listing,
					owner: ctx.memberEntity,
					amount: market.amount,
				}).save();
			}

			await market.remove();
			await ctx.embedify('success', 'user', `${Emojis.CHECK} Successfully Removed Market`).send();
		}
	};
}
