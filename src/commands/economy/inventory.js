const inventorySchema = require('../../util/mongo/schemas/inventory-sch');
const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription(commands.commands.inventory.description)
		.addUserOption((option) =>
			option.setName('user').setDescription('Specify a user.')
		)
		.addIntegerOption((option) =>
			option.setName('page').setDescription('Specify the page.')
		),
	async run(interaction) {
		await interaction.deferReply();
		const user = interaction.options.getUser('user') ?? interaction.member.user;
		let profile = await inventorySchema.findOne({
			userID: user.id,
			guildID: interaction.guild.id,
		});
		if (!profile?.inventory) {
			profile = await new inventorySchema({
				userID: user.id,
				guildID: interaction.guild.id,
				inventory: [],
			}).save();
		}

		const page = interaction.options.getInteger('page') ?? 1;
		const embeds = [];
		let entries = 15;
		const pageCount = Math.ceil(profile.inventory.length / entries) || 1;

		let k = 0;
		let volume = 0;
		for (let i = 0; i < pageCount; i++) {
			let embed = new Discord.MessageEmbed()
				.setAuthor(`${user.tag}`, user.displayAvatarURL())
				.setColor('BLUE');

			for (let j = 0; j < entries; j++) {
				const item = profile.inventory[k++];
				if (item) {
					volume += item.amount;
					embed.addField(
						item.name,
						`Amount: \`${item.amount}\`${
							item.lastGenerateAt
								? `\nIncome Ready: \`${!item.collected}\``
								: ''
						}`,
						true
					);
				}
			}
			embeds.push(
				embed
					.setDescription(
						`${
							interaction.member.user.tag == user.tag || !user
								? 'You have '
								: user.tag + ' has '
						} \`${
							profile.inventory.length
						}\` inventory items.\nTotal volume: \`${volume}\``
					)
					.setFooter(`Page ${i + 1} of ${pageCount}`)
			);
		}

		await util.paginate(interaction, embeds, page - 1);
	},
};
