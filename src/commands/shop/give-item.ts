import { Message } from "discord.js";
import { itemRegExp } from "../../lib";
import { ShopModel } from "../../models";
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from "../../structures";

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('give-item')
		.setDescription('Give a user a new instance of an existing item.')
		.setModule('SHOP')
		.setAuthority('MANAGER')
		.addUserOption((options) =>
			options
				.setName('user')
				.setDescription('The user to give the item(s) to.')
				.setRequired(true)
		)
		.addStringOption((options) => 
			options
				.setName('name')
				.setDescription('The name of the item to give.')
				.setRequired(true)
		)
		.addIntegerOption((options) => 
			options
				.setName('amount')
				.setDescription('The amount of this item to give to the user.')
		)
	
	execute = async (ctx: Context): Promise<void | Message<boolean>> => {
		const { interaction } = ctx;

		const user = interaction.options.getUser('user');
		const item = await ShopModel.findOne({ guild: ctx.guildDocument, name: itemRegExp(interaction.options.getString('name')) });
		const amount = interaction.options.getInteger('amount') || 1;

		if (!item)
			return await ctx.embedify('error', 'user', `No item with name \`${item.name}\` found (case-insensitive)`, true);

		if (amount <= 0)
			return await ctx.embedify('error', 'user', '`amount` must be a positive integer greater than 0.', true);
		await ctx.embedify('success', 'user', `Gave ${amount} x \`${item.name}\` to ${user.username}`, false);

		const invItem = ctx.memberDocument.inventory.find(i => `${i.shop?._id}` == `${item._id}`);

		if (invItem) {
			invItem.amount += amount;
			ctx.memberDocument.markModified('inventory');
		} else {
			ctx.memberDocument.inventory.push({ shop: item, amount });
			ctx.memberDocument.markModified('inventory');
		}

		await ctx.memberDocument.save();
		return;
	}
}