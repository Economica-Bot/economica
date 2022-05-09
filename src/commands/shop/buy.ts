import { Snowflake } from 'discord.js';
import { Item, Listing } from '../../entities';
import { recordTransaction } from '../../lib';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('buy')
		.setDescription('Buy a listing.')
		.setModule('SHOP')
		.setFormat('buy <listing> [amount]')
		.setExamples(['buy boat', 'buy car 10'])
		.addStringOption((option) => option.setName('name').setDescription('Specify the name of the listing').setRequired(true))
		.addIntegerOption((option) => option.setName('amount').setDescription('Specify the amount of items to purchase').setMinValue(1));

	public execute = async (ctx: Context) => {
		const name = ctx.interaction.options.getString('name');
		const amount = ctx.interaction.options.getInteger('amount') ?? 1;
		const listing = await Listing.findOneBy({ guild: { id: ctx.guildEntity.id }, name });

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

		if (!listing) await ctx.embedify('error', 'user', `Could not find listing with name \`${name}\`.`).send();
		else if (!listing.active) await ctx.embedify('warn', 'user', 'This listing is not active.').send();
		else if (listing.stock < 1) await ctx.embedify('warn', 'user', 'This listing is out of stock.').send();
		else if (!listing.stackable && amount > 1) await ctx.embedify('warn', 'user', 'You cannot buy more than 1x of this item.').send();
		else if (amount > listing.stock) await ctx.embedify('warn', 'user', `You cannot buy that amount. Current stock: \`${listing.stock}\`.`).send();
		else if (missingItems.length) await ctx.embedify('warn', 'user', `You must own ${missingItems.map((item) => `\`${item.name}\``).join(', ')} to purchase this listing.`).send();
		else if (missingRoles.length) await ctx.embedify('warn', 'user', `You must have the roles ${missingRoles.map((role) => `<@${role}>`).join(', ')} to buy this item.`).send();
		else if (listing.treasuryRequired > ctx.memberEntity.treasury) await ctx.embedify('warn', 'user', `You must have a treasury balance of ${ctx.guildEntity.currency}${listing.treasuryRequired} to purchase this listing.`).send();
		else if (listing.price > ctx.memberEntity.wallet) await ctx.embedify('warn', 'user', 'You cannot afford this item.').send();
		if (ctx.interaction.replied) return;

		// Purchase complete
		listing.stock -= amount;
		await listing.save();

		await Item.create({
			listing,
			owner: ctx.memberEntity,
			amount,
		}).save();

		await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'BUY', -listing.price, 0);
		await ctx.embedify('success', 'user', `${Emojis.SHOP} **Listing Purchased Successfully**`).send();
	};
}
