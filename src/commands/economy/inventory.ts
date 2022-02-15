import { EmbedFieldData, Message, MessageEmbed } from "discord.js";
import { paginate } from "../../lib";
import { MemberModel, ShopModel } from "../../models";
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from "../../structures";

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('inventory')
		.setDescription('View yours or another member\'s inventory')
		.setFormat('[user]')
		.setModule('ECONOMY')
		.addUserOption((options) => 
			options
				.setName('user')
				.setDescription('The target user whose inventory to shwow')
		)
	public execute = async(ctx: Context): Promise<void | Message<boolean>> => {
		const { interaction } = ctx;
		const user = interaction.options.getUser('user') || interaction.user
		const memberDocument = await MemberModel.findOne({
			guildId: interaction.guildId,
			userId: user.id
		})
		const shop = await ShopModel.find({
			guildId: interaction.guildId
		}).sort({ price: -1 })

		if (!memberDocument.inventory.length)
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setAuthor({
							name: interaction.user.tag,
							iconURL: interaction.user.avatarURL()
						})
						.setColor('BLUE')
						.setTitle(`${user.tag}'s Inventory`)
						.setDescription(`${user.username} has no items`)
				]
			})
		
			const embeds: MessageEmbed[] = [];
			const maxEntries = 30;
			const entries: string[] = []

			memberDocument.inventory.forEach(invItem => {
				const item = shop.find(item => `${invItem.refId}` == `${item._id}`);

				entries.push(`\`${item.name}\` (${invItem.amount})`); // forming three-column display (right-left top-down)
			})

			const pageCount = Math.ceil(entries.length / maxEntries) || 1;

			let k = 0;
				for (let i = 0; i < pageCount; i++) {
					let columns: string[] = ['', '', '']
					for (let j = 0; j < maxEntries && entries[k]; j++, k++) {
						if (entries[k]) {
							columns[k % 3] += entries[k] + '\n'
							console.log(entries[k])
						}
					}
	
					embeds.push(
						new MessageEmbed()
						.setAuthor({
							name: interaction.user.tag,
							iconURL: interaction.user.avatarURL()
						})
						.setColor('BLUE')
						.setTitle(`${user.tag}'s Inventory`)
						.setDescription(`${user.username} has \`${entries.length}\` distinct items and a total volume of \`${k}\` items.`)
						.setFields([
							{ name: '\u200b', value: columns[0].length? columns[0] : '\u200b', inline: true },
							{ name: '\u200b', value: columns[1].length? columns[1] : '\u200b', inline: true },
							{ name: '\u200b', value: columns[2].length? columns[2] : '\u200b', inline: true }
						])
					)
				}
	
				await paginate(ctx.interaction, embeds, 0);
	}
}