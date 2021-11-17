const econonomySchema = require('../../util/mongo/schemas/economy-sch');
const path = require('path');
const util = require(path.join(__dirname, '../../util/util'));
const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription(commands.commands.leaderboard.description)
		.addStringOption((option) =>
			option
				.setName('type')
				.setDescription('Pick a choice.')
				.addChoices([
					['Wallet', 'wallet'],
					['Treasury', 'treasury'],
					['Total', 'total'],
				])
		)
		.addIntegerOption((option) =>
			option.setName('page').setDescription('Specify the page.')
		),
	async run(interaction) {
		await interaction.deferReply();

		const currencySymbol = await util.getCurrencySymbol(interaction.guild.id),
			type = interaction.options.getString('type') ?? 'total';
		const profiles = await econonomySchema
			.find({ guildID: interaction.guild.id })
			.sort({ [type]: -1 });
		const embeds = [];
		const page = interaction.options.getInteger('page') ?? 1;
		let entries = 10;
		let rank = 1;

		const pageCount = Math.ceil(profiles.length / entries);
		const leaderboardEntries = [];
		profiles.map((profile) => {
			const userID = profile.userID;
			const balance = profile[type];
			leaderboardEntries.push(
				rank++ == 1
					? `<:RichestPlayer:906756586553372693> • <@${userID}> | ${currencySymbol}${util
							.num(balance)
							.toLocaleString()}\n\n`
					: `\`${(rank - 1)
							.toString()
							.padStart(2, '0')}\` • <@${userID}> | ${currencySymbol}${util
							.num(balance)
							.toLocaleString()}\n`
			);
		});

		let k = 0;
		for (let i = 0; i < pageCount; i++) {
			description = '';
			for (let j = 0; j < entries; j++) {
				if (leaderboardEntries[k]) {
					description += leaderboardEntries[k++];
				}
			}
			embeds.push(
				new Discord.MessageEmbed()
					.setAuthor(
						`${interaction.guild}'s ${type} Leaderboard`,
						interaction.guild.iconURL()
					)
					.setColor('BLUE')
					.setDescription(description)
					.setFooter(`Page ${i + 1} of ${pageCount}`)
			);
		}

		await util.paginate(interaction, embeds, page - 1);
	},
};
