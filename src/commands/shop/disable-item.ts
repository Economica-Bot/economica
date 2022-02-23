import { cut, itemRegExp } from '../../lib/index.js';
import { ListingModel } from '../../models/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	data = new EconomicaSlashCommandBuilder()
		.setName('disable-item')
		.setDescription('Disable shop items.')
		.setAuthority('MANAGER')
		.setModule('SHOP')
		.addStringOption((option) => option.setName('name').setDescription('Specify the name of the item.').setRequired(true));

	execute = async (ctx: Context) => {
		const query = ctx.interaction.options.getString('name');
		if (query !== 'all') {
			const shopItem = await ListingModel.findOneAndUpdate(
				{ guild: ctx.guildDocument, name: itemRegExp(query) },
				{ active: false },
			);
			if (!shopItem) {
				return ctx.embedify('error', 'user', `No item with name ${cut(query)} found (case-insensitive).`, true);
			}
			return ctx.embedify('success', 'user', `\`${shopItem.name}\` disabled.`, false);
		}
		const shopItems = await ListingModel.updateMany({ guild: ctx.guildDocument }, { active: false });
		return ctx.embedify('success', 'user', `Enabled ${shopItems.nModified} shop items.`, false);
	};
}
