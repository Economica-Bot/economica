const inventorySchema = require('../../util/mongo/schemas/inventory-sch');
const shopItemSchema = require('../../util/mongo/schemas/shop-item-sch');
const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('collect')
		.setDescription(commands.commands.collect.description),
	async run(interaction) {
		const user = await inventorySchema.findOne({
			guildID: interaction.guild.id,
			userID: interaction.member.id,
		});

		if (!user)
			return interaction.reply(util.error("You don't have any items."));
		const now = new Date();
		const inventory = user.inventory;
		let amount = 0;

		let description = 'Collected generator money\n';
		let count = 0;
		const currencySymbol = await util.getCurrencySymbol(interaction.guild.id);

		await Promise.all(
			inventory.map(async (item) => {
				const shopItem = await shopItemSchema.findOne({
					guildID: interaction.guild.id,
					name: item.name,
				});
				const itemIndex = inventory.findIndex((i) => i.name == item.name);
				if (
					inventory[itemIndex].hasOwnProperty('collected') &&
					!inventory[itemIndex].collected
				) {
					inventory[itemIndex].collected = true;
					inventory[itemIndex].lastGenerateAt = now.getTime();
					amount += shopItem.generatorAmount;
					await util.transaction(
						interaction.guild.id,
						interaction.member.id,
						'GENERATOR',
						`\`${shopItem.name}\``,
						0,
						shopItem.generatorAmount,
						shopItem.generatorAmount
					);
					description += `\n\`${++count}.\` **${
						shopItem.name
					}** | ${currencySymbol}${shopItem.generatorAmount.toLocaleString()}`;
				}
			})
		);

		if (amount) {
			await interaction.reply(util.success(description));
			await inventorySchema.findOneAndUpdate(
				{
					guildID: interaction.guild.id,
					userID: interaction.member.id,
				},
				{
					inventory,
				}
			);
		} else {
			await interaction.reply(
				util.error('You do not have any money to collect.')
			);
		}
	},
};
