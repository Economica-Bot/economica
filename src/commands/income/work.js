const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('work')
		.setDescription(commands.commands.work.description),
	async run(interaction) {
		const guildID = interaction.guild.id,
			userID = interaction.member.id;
		const { min, max } = await util.getIncomeCommandStats(guildID, this.data.name);

		const currencySymbol = await util.getCurrencySymbol(guildID);
		const amount = util.intInRange(min, max);
		const embed = util.embedify(
			'GREEN',
			interaction.user.tag,
			interaction.user.displayAvatarURL(),
			`You worked and earned ${currencySymbol}${amount.toLocaleString()}!`
		);

		await interaction.reply({ embeds: [embed] });

		await util.transaction(
			guildID,
			userID,
			this.data.name,
			'`system`',
			amount,
			0,
			amount
		);
	},
};
