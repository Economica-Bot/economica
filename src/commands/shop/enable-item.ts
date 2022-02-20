import { cut, itemRegExp } from "../../lib";
import { ShopModel } from "../../models";
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from "../../structures";

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('enable-item')
		.setDescription('Enable a shop item.')
		.setAuthority('MANAGER')
		.setModule('SHOP')
		.addStringOption((option) =>
			option.setName('name').setDescription('Specify the name of the item.').setRequired(true)
		)
	execute = async (ctx: Context) => {
		const name = ctx.interaction.options.getString('name')
		const shopItem = await ShopModel.findOneAndUpdate({ name: itemRegExp(name) }, { active: true });
		if (!shopItem) {
			return await ctx.embedify('error', 'user', `No item with name \`${cut(name)}\` found (case-insensitive).`, true);
		} else {
			return await ctx.embedify('success', 'user', `\`${shopItem.name}\` enabled.`, false);
		}
	}
}