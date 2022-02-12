import { GuildMemberRoleManager, Message } from "discord.js";
import { MemberModel, ShopModel } from "../../models";
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from "../../structures";

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('use')
		.setDescription('Use a usable inventory item.')
		.setModule('SHOP')
		.addStringOption((options) => 
			options
				.setName('name')
				.setDescription('The name of the item to use.')
				.setRequired(true)
		)
	
		public execute = async (ctx: Context): Promise<Message | void> => {
			const { interaction, memberDocument } = ctx;
			const query = interaction.options.getString('name');

			const item = await ShopModel.findOne({
				guildId: interaction.guildId,
				name: query	
			})

			if (!item)
				return await ctx.embedify('error', 'user', `No item with name \`${query}\` exists.`, true)
			
			const { inventory } = memberDocument;

			const inventoryItem = inventory.find(invItem => `${invItem.refId}` == `${item._id}`)

			if (!inventoryItem)
				return await ctx.embedify('error', 'user', `No item with name \`${query}\` (case-insensitive) found in inventory.`, true)

			if (item.usability == 'Usable') {
				const embed = ctx.embedify('success', 'user', `Used \`${item.name}\` x1`)

				if (item.rolesGiven.length) {
					item.rolesGiven.forEach((roleId) => {
						(ctx.interaction.member.roles as GuildMemberRoleManager).add(roleId, `Purchased ${item.name}`);
					});

					embed.addField('Roles Given', `<@&${item.rolesGiven.join('>, <@&')}>`)
				}
				if (item.rolesRemoved.length) {
					item.rolesRemoved.forEach((roleId) => {
						(ctx.interaction.member.roles as GuildMemberRoleManager).remove(roleId, `Purchased ${item.name}`);
					})

					embed.addField('Roles Removed', `<@&${item.rolesRemoved.join('>, <@&')}>`)
				}
					
				return await interaction.reply({
					embeds: [embed]
				})
			} else if (item.usability == 'Unusable')
				return await ctx.embedify('error', 'user', 'This item is unusable.', true)
		}
}