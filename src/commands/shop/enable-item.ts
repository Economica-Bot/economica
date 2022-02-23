import { cut, itemRegExp } from '../../lib/index.js';
import { ListingModel } from '../../models/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	data = new EconomicaSlashCommandBuilder()
		.setName('enable-item')
		.setDescription('Enable a shop item.')
		.setAuthority('MANAGER')
		.setModule('SHOP')
		.addStringOption((option) => option.setName('name').setDescription('Specify the name of the item.').setRequired(true));

	execute = async (ctx: Context) => {
		const name = ctx.interaction.options.getString('name');
		const shopItem = await ListingModel.findOneAndUpdate({ name: itemRegExp(name) }, { active: true });
		if (!shopItem) {
			await ctx.embedify('error', 'user', `No item with name \`${cut(name)}\` found (case-insensitive).`, true);
		} else {
			await ctx.embedify('success', 'user', `\`${shopItem.name}\` enabled.`, false);
		}
	};
}
