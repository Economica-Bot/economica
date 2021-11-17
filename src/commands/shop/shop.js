const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription(commands.commands.shop.description)
		.addIntegerOption((option) =>
			option.setName('page').setDescription('Specify the page.')
		),
	async run(interaction) {
		await interaction.deferReply();
		const items = await util.getShopItems(interaction.guild.id);
		if (items.length === 0) {
			let embed = new Discord.MessageEmbed()
				.setAuthor(
					`${interaction.guild.name} Shop`,
					interaction.guild.iconURL()
				)
				.setColor('BLUE')
				.setDescription(
					`There are currently \`0\` items in the shop.\nAsk your Economy Manager to add some!`
				);

			interaction.editReply({
				embeds: [embed],
			});
			return;
		} else {
			const page = interaction.options.getInteger('page') ?? 1;
			const embeds = [];
			let maxEntries = 15;
			const shopEntries = [];
			const currencySymbol = await util.getCurrencySymbol(interaction.guild.id);
			items.forEach((item) => {
				if (item.active) {
					shopEntries.push(item);
				}
			});
			const pageCount = Math.ceil(shopEntries.length / maxEntries);
			let k = 0;
			for (let i = 0; i < pageCount; i++) {
				// Construct each page
				let embed = new Discord.MessageEmbed()
					.setAuthor(
						`${interaction.guild.name} Shop`,
						interaction.guild.iconURL()
					)
					.setColor('BLUE');
				for (let j = 0; j < maxEntries; j++) {
					if (shopEntries[k]) {
						const item = shopEntries[k];
						// Push fields for each active item to the page
						embed.addField(
							`${currencySymbol}${
								item.price > 0 ? util.num(item.price) : 'Free'
							} - ${util.cut(item.name)}`,
							`**${item.type}** ${
								item.duration
									? `Expires in <t:${
											Date.now() + new Date(item.createdAt).getMilliseconds()
									  }:R>`
									: ''
							}\n*${util.cut(item.description, 200)}*`,
							item.description?.length > 100 ? false : true
						);
						k++;
					}
				}
				embeds.push(
					embed
						.setDescription(
							`There are currently \`${shopEntries.length}\` items in the shop. Use the \`item view\` command to view detailed item stats, use the \`item buy\` command to purchase an item!`
						)
						.setFooter(`Page ${i + 1} of ${pageCount}`)
				);
			}

			await util.paginate(interaction, embeds, page - 1);
		}
	},
};
