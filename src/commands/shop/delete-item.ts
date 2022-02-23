import { itemRegExp } from '../../lib/index.js';
import { ListingModel, MemberModel } from '../../models/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	data = new EconomicaSlashCommandBuilder()
		.setName('delete-item')
		.setDescription('Delete shop items.')
		.setAuthority('MANAGER')
		.setModule('SHOP')
		.addStringOption((options) => options
			.setName('name')
			.setDescription('The name of the item to delete or "all"')
			.setRequired(true));

	execute = async (ctx: Context) => {
		const name = ctx.interaction.options.getString('name');
		if (name !== 'all') {
			const shopItem = await ListingModel.findOne({ guild: ctx.guildDocument, name: itemRegExp(name) });
			if (!shopItem) return ctx.embedify('error', 'user', `Could not find an item with name \`${name}\` (case-insensitive).`, true);
			const updates = await MemberModel.updateMany(
				{ guild: ctx.guildDocument },
				{ $pull: { inventory: { shop: shopItem._id } } },
			);

			await shopItem.deleteOne();
			return ctx.embedify('success', 'user', `Item deleted. ${updates.nModified} inventories affected.`, false);
		}

		const deleted = await ListingModel.deleteMany({
			guild: ctx.guildDocument,
		});

		const updates = await MemberModel.updateMany(
			{ guild: ctx.guildDocument },
			{ $pull: { inventory: {} } },
		);

		return ctx.embedify('success', 'user', `Items Deleted: \`${deleted.deletedCount}\`\nInventories Affect: \`${updates.nModified}\``, true);
	};
}
