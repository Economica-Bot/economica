import { cut, itemRegExp } from "../../lib";
import { ShopModel } from "../../models";
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from "../../structures";

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('disable-item')
		.setDescription('Disable shop items.')
		.setAuthority('MANAGER')
		.setModule('SHOP')
		.addStringOption((option) =>
			option.setName('name').setDescription('Specify the name of the item.').setRequired(true)
		)
	execute = async (ctx: Context) => {
		const query = ctx.interaction.options.getString('name')
		if (query != 'all') {
			const shopItem = await ShopModel.findOneAndUpdate(
				{ guild: ctx.guildDocument, name: itemRegExp(query) },
				{ active: false }
			);
			if (!shopItem) {
				return await ctx.embedify('error', 'user', `No item with name ${cut(query)} found (case-insensitive).`, true);
			} else {
				return await ctx.embedify('success', 'user', `\`${shopItem.name}\` disabled.`, false);
			}
		} else {
			const shopItems = await ShopModel.updateMany({ guild: ctx.guildDocument }, { active: false });
			return await ctx.embedify('success', 'user', `Enabled ${shopItems.nModified} shop items.`, false);
		}
	}
}