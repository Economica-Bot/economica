import { Message, MessageEmbed } from "discord.js";
import { itemRegExp } from "../../lib";
import { confirmModal } from "../../lib/confirmModal";
import { MemberModel, ShopModel } from "../../models";
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from "../../structures";

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('delete-item')
		.setDescription('Delete shop items.')
		.setAuthority('MANAGER')
		.setModule('SHOP')
		.addStringOption((options) =>
			options
				.setName('name')
				.setDescription('The name of the item to delete or "all"')
				.setRequired(true)
		)

	execute = async (ctx: Context) => {
		const name = ctx.interaction.options.getString('name')
		if (name != 'all') {
			const shopItem = await ShopModel.findOne({ guild: ctx.guildDocument, name: itemRegExp(name)})
			if (!shopItem) {
				return await ctx.embedify('error', 'user', `Could not find an item with name \`${name}\` (case-insensitive).`, true);
			} else {
				const updates = await MemberModel.updateMany(
					{ guild: ctx.guildDocument },
					{ $pull: { inventory: { shop: shopItem._id } } }
				);

				await shopItem.deleteOne()

				return await ctx.embedify(
					'success',
					'user',
					`Item deleted. ${updates.nModified} inventories affected.`,
					false
				);
			}
		} else {
			await confirmModal(ctx.interaction, {
				promptEmbed: ctx.embedify('info', 'user', 'Are you sure you want to delete __all items__?'),
				confirmEmbed: ctx.embedify('success', 'user', `Successfully deleted all items in the ${ctx.interaction.guild.name} shop.`),
				cancelEmbed: ctx.embedify('warn', 'user', 'Action abandoned: cancelled by user.')
			}, async (reply: Message<boolean>, confirmEmbed: MessageEmbed) => {
				const deleted = await ShopModel.deleteMany({
					guild: ctx.guildDocument
				});

				const updates = await MemberModel.updateMany(
					{ guild: ctx.guildDocument },
					{ $pull: { inventory: {} } }
				);

				reply.edit({
					embeds: [confirmEmbed.setDescription(`${confirmEmbed.description}\n\nItems Deleted: \`${deleted.deletedCount}\`\nInventories Affect: \`${updates.nModified}\``)]
				});
			}, true) // is ephemeral
		}
	}
}