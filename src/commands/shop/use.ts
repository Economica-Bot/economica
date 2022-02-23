import { GuildMemberRoleManager } from 'discord.js';

import { Listing } from '../../models/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('use')
		.setDescription('Use an inventory item')
		.setModule('SHOP')
		.setFormat('use <item>')
		.setExamples(['use Bike'])
		.addStringOption((options) => options.setName('name').setDescription('Specify an item').setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const query = ctx.interaction.options.getString('name');
		await ctx.memberDocument.populate({ path: 'inventory', populate: { path: 'listing', model: 'Listings' } }).execPopulate();
		const inventoryItem = ctx.memberDocument.inventory.find((listing) => listing.listing.name === query);
		const { listing }: { listing: Listing } = inventoryItem;
		if (!listing) return ctx.embedify('error', 'user', 'You do not have that item in your inventory.', true);
		const embed = ctx.embedify('success', 'user', `Used \`${listing.name}\` x1`);
		if (listing.rolesGiven.length) {
			listing.rolesGiven.forEach((roleId) => {
				(ctx.interaction.member.roles as GuildMemberRoleManager).add(roleId, `Purchased ${listing.name}`);
			});

			embed.addField('Roles Given', `<@&${listing.rolesGiven.join('>, <@&')}>`);
		}

		if (listing.rolesRemoved.length) {
			listing.rolesRemoved.forEach((roleId) => {
				(ctx.interaction.member.roles as GuildMemberRoleManager).remove(roleId, `Purchased ${listing.name}`);
			});

			embed.addField('Roles Removed', `<@&${listing.rolesRemoved.join('>, <@&')}>`);
		}

		if (inventoryItem.amount === 1) inventoryItem.remove();
		else inventoryItem.amount -= 1;
		ctx.memberDocument.markModified('inventory');
		await ctx.memberDocument.save();
		return ctx.interaction.reply({
			embeds: [embed],
		});
	};
}
