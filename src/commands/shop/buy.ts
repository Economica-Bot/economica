import { Snowflake } from 'discord.js';
import { Item, Listing } from '../../entities/index.js';
import { recordTransaction } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { Emojis } from '../../typings/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('buy')
		.setDescription('Buy a listing')
		.setModule('SHOP')
		.setFormat('buy <listing> [amount]')
		.setExamples(['buy boat', 'buy car 10'])
		.addStringOption((option) => option.setName('listing_id').setDescription('Specify the id of the listing').setRequired(true))
		.addIntegerOption((option) => option.setName('amount').setDescription('Specify the amount of items to purchase').setMinValue(1));

	public execute = async (ctx: Context) => {
		const id = ctx.interaction.options.getString('listing_id');
		const amount = ctx.interaction.options.getInteger('amount') ?? 1;
		const listing = await Listing.findOneBy({ guild: { id: ctx.guildEntity.id }, id });
		const existingItem = await Item.findOneBy({ owner: { guildId: ctx.guildEntity.id, userId: ctx.userEntity.id }, listing: { id } });

		// Validation
		const missingItems: Listing[] = [];
		listing?.itemsRequired?.forEach(async (item) => {
			const memberItem = await Item.findOneBy({ owner: { userId: ctx.memberEntity.userId, guildId: ctx.memberEntity.guildId }, listing: { id: item.id } });
			if (!memberItem) missingItems.push(item);
		});
		const missingRoles: Snowflake[] = [];
		listing?.rolesRequired?.forEach(async (role) => {
			if (!ctx.interaction.member.roles.cache.has(role)) missingRoles.push(role);
		});

		if (!listing) await ctx.embedify('error', 'user', `Could not find listing with id \`${id}\`.`).send();
		else if (!listing.active) await ctx.embedify('warn', 'user', 'This listing is **not active**.').send();
		else if (listing.stock < 1) await ctx.embedify('warn', 'user', 'This listing is **out of stock**.').send();
		else if (!listing.stackable && amount > 1) await ctx.embedify('warn', 'user', 'You cannot buy more than `1x` of this item.').send();
		else if (listing.type === 'INSTANT' && amount > 1) await ctx.embedify('warn', 'user', 'You cannot buy more than `1` usable item at a time.').send();
		else if (!listing.stackable && existingItem) await ctx.embedify('warn', 'user', 'You **already own** this item.').send();
		else if (amount > listing.stock) await ctx.embedify('warn', 'user', `You cannot buy that amount. **Current stock:** \`${listing.stock}\`.`).send();
		else if (missingItems.length) await ctx.embedify('warn', 'user', `You must own ${missingItems.map((item) => `\`${item.name}\``).join(', ')} to purchase this listing.`).send();
		else if (missingRoles.length) await ctx.embedify('warn', 'user', `You must have the roles ${missingRoles.map((role) => `<@${role}>`).join(', ')} to buy this item.`).send();
		else if (listing.treasuryRequired > ctx.memberEntity.treasury) await ctx.embedify('warn', 'user', `You must have a **treasury balance** of ${ctx.guildEntity.currency}${listing.treasuryRequired} to purchase this listing.`).send();
		else if (listing.price > ctx.memberEntity.wallet) await ctx.embedify('warn', 'user', 'You **cannot afford** this item.').send();
		if (ctx.interaction.replied) return;

		// Purchase complete
		listing.stock -= amount;
		await listing.save();

		if (existingItem) {
			existingItem.amount += amount;
			await existingItem.save();
		} else {
			const item = await Item.create({
				listing,
				owner: ctx.memberEntity,
				amount,
			}).save();
			if (item.listing.type === 'INSTANT') {
				item.listing.rolesGiven.forEach((role) => ctx.interaction.member.roles.add(role, `Purchased ${item.listing.name}`));
				item.listing.rolesRemoved.forEach((role) => ctx.interaction.member.roles.remove(role, `Purchased ${item.listing.name}`));
				await item.remove();
			}
		}

		await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'BUY', -listing.price, 0);
		await ctx.embedify('success', 'user', `${Emojis.SHOP} **Listing Purchased Successfully**`).send();
	};
}
