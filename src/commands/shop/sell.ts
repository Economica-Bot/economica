import { GuildMemberRoleManager, Message } from 'discord.js';

import { transaction } from '../../lib';
import { MemberModel, ShopModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('sell')
		.setDescription('Sell an item.')
		.setModule('SHOP')
		.addStringOption((option) => option.setName('item').setDescription('Specify an item.').setRequired(true));

	public execute = async (ctx: Context): Promise<Message> => {
		const query = ctx.interaction.options.getString('item');
		const item = await ShopModel.findOne({ guildId: ctx.interaction.guildId, name: query, active: true });
		const hasItem = ctx.memberDocument.inventory.some((i) => i.refId === item._id);
		const invItem = ctx.memberDocument.inventory.find((i) => i.refId === item._id);
		const { currency } = ctx.guildDocument;

		if (!item) {
			return await ctx.embedify('error', 'user', 'Could not find an item with that name.', true);
		} else if (!hasItem) {
			return await ctx.embedify('warn', 'user', 'You do not have this item.', true);
		}

		transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			ctx.client.user.id,
			'SELL',
			item.price,
			0,
			item.price
		);

		item.rolesGiven.forEach((roleId) => {
			(ctx.interaction.member.roles as GuildMemberRoleManager).add(roleId, `Purchased ${item.name}`);
		});

		if (invItem.amount === 1) {
			ctx.memberDocument.updateOne({ $pull: { inventory: { name: item.name } } });
		} else {
			// prettier-ignore
			MemberModel.findOneAndUpdate(
				{ 'inventory.name': item.name }, 
				{ $inc: { 'inventory.$.amount': -1 } 
			});
		}

		item.updateOne({ $inc: { stock: 1 } });

		return await ctx.embedify(
			'success',
			'user',
			`Sold \`${item.name}\` for ${currency}${item.price.toLocaleString()}`,
			false
		);
	};
}
