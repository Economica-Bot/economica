import { GuildMemberRoleManager } from 'discord.js';

import { getEconInfo, itemRegExp, transaction } from '../../lib/index.js';
import { Listing, ListingModel } from '../../models/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('buy')
		.setDescription('Purchase a listing item')
		.setModule('SHOP')
		.setFormat('buy <item> [amount]')
		.setExamples(['buy Bike', 'buy Bike 10'])
		.addStringOption((option) => option.setName('name').setDescription('Specify the name.').setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const query = ctx.interaction.options.getString('name');
		const listing = await ListingModel.findOne({ guild: ctx.guildDocument, name: itemRegExp(query), active: true });
		if (!listing) return ctx.embedify('error', 'user', `Could not find an item with name \`${query}\` (case-insensitive)`, true);
		await ctx.memberDocument.populate({ path: 'inventory.listing', model: 'Listing' }).execPopulate();
		const hasItem = ctx.memberDocument.inventory.some((item) => item.listing._id.toString() === listing._id.toString());
		const { wallet, treasury } = await getEconInfo(ctx.memberDocument);
		await listing.populate('requiredItems').populate('missingRoles').execPopulate();
		const missingItems = listing.requiredItems.filter((listing: Listing) => !ctx.memberDocument.inventory.some((entry) => entry.listing._id === listing._id));
		const missingRoles = listing.requiredRoles.filter((role) => !ctx.interaction.member.roles.cache.has(role));

		if (!listing) {
			return ctx.embedify('error', 'user', 'Could not find an item with that name.', true);
		} if (listing.price > wallet) {
			return ctx.embedify('warn', 'user', 'You cannot afford this item.', true);
		} if (listing.requiredTreasury > treasury) {
			return ctx.embedify('warn', 'user', `You need ${ctx.guildDocument.currency}${listing.requiredTreasury.toLocaleString()} in your treasury.`, true);
		} if (missingItems.length) {
			return ctx.embedify('warn', 'user', `You are missing \`${missingItems.join('`, `')}\`.`, true);
		} if (missingRoles.length) {
			return ctx.embedify('warn', 'user', `You are missing <@&${missingRoles.join('>, <@&')}>.`, true);
		} if (hasItem && !listing.stackable) {
			return ctx.embedify('warn', 'user', 'This item is not stackable.', true);
		}

		if (listing.type === 'INSTANT') {
			listing.rolesRemoved.forEach(async (roleId) => {
				(ctx.interaction.member.roles as GuildMemberRoleManager).remove(roleId, `Purchased ${listing.name}`);
			});
			listing.rolesGiven.forEach((roleId) => {
				(ctx.interaction.member.roles as GuildMemberRoleManager).add(roleId, `Purchased ${listing.name}`);
			});
		}

		await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.clientDocument, 'BUY', -listing.price, 0);
		if (hasItem) {
			ctx.memberDocument.inventory.find((v) => `${v.listing._id}` === `${listing._id}`).amount += 1;
			ctx.memberDocument.markModified('inventory');
		} else {
			ctx.memberDocument.inventory.push({ listing, amount: 1 });
		}

		await ctx.memberDocument.save();
		listing.stock -= 1;
		listing.save();
		return ctx.embedify('success', 'user', `Purchased \`${listing.name}\` for ${ctx.guildDocument.currency}${listing.price.toLocaleString()}`, false);
	};
}
