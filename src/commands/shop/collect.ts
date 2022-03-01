import { MessageEmbed } from "discord.js";
import ms from "ms";
import { transaction } from "../../lib";
import { InventoryItem, Shop } from "../../models";
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from "../../structures";

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('collect')
		.setDescription('Collect all money from generators.')
		.setModule('SHOP')
	execute = async (ctx: Context) => {
		const collected = new Array<InventoryItem>();
		const other = new Array<[InventoryItem, number]>();

		await ctx.memberDocument.populate({
			path: 'inventory.shop',
			model: 'Shop'
		}).execPopulate();

		ctx.memberDocument.inventory.forEach(invItem => {
			const shop = invItem.shop as Shop;
			console.log(shop.name, shop.type)

			if (shop.type != 'GENERATOR')
				return;

			const timeElapsed = Date.now() - invItem.lastCollectedAt.getTime();
			if (timeElapsed >= shop.generatorPeriod) {
				collected.push(invItem);
				ctx.memberDocument.inventory[ctx.memberDocument.inventory.indexOf(invItem)].lastCollectedAt = new Date();
				ctx.memberDocument.markModified('inventory')
			}
			else
				other.push([invItem, shop.generatorPeriod - timeElapsed]);
		})

		const embed = new MessageEmbed()
			.setAuthor({
				name: ctx.interaction.user.tag,
				iconURL: ctx.interaction.user.avatarURL()
			})
		if (collected.length || other.length) {
			let collectedField = '';
			let otherField = '';
			let moneySum = 0;

			collected.forEach(invItem => {
				collectedField += `Collected ${ctx.guildDocument.currency}${(invItem.shop as Shop).generatorAmount * invItem.amount} from \`${(invItem.shop as Shop).name}\` x ${invItem.amount}\n`

				moneySum += (invItem.shop as Shop).generatorAmount * invItem.amount;
			})

			other.forEach(([invItem, timeLeft]) => {
				otherField += `${ms(timeLeft)} left on \`${(invItem.shop as Shop).name}\` x ${invItem.amount}\n`
			})
			embed
				.setColor(collected.length? 'GREEN' : 'BLUE')
				.setDescription('Generator income was deposited to treasury as follows.')
				.setFields([{
					name: 'Collected',
					value: collectedField.length? collectedField.substring(0, collectedField.length) : 'None'
				}, {
					name: 'Still Generating',
					value: otherField.length? otherField.substring(0, otherField.length) : 'None'
				}])

				await ctx.interaction.reply({
					embeds: [embed]
				})
			await ctx.memberDocument.save();
			await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.memberDocument, 'GENERATOR', 0, moneySum);
			return;
		} else {
			embed
				.setColor('RED')
				.setDescription('You have no generators.')
			return await ctx.interaction.reply({
				embeds: [embed],
				ephemeral: true
			})
		}
	}
}