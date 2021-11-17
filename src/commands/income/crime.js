const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('crime')
		.setDescription(commands.commands.crime.description),
	async run(interaction) {
		const guildID = interaction.guild.id,
			userID = interaction.member.id;
		const properties = await util.getIncomeCommandStats(guildID, this.data.name);

		let color, description, amount;
		const { min, max, minfine, maxfine } = properties;
		const cSymbol = await util.getCurrencySymbol(guildID);
		if (!util.isSuccess(properties)) {
			amount = util.intInRange(minfine, maxfine);
			color = 'RED';
			description = `You were caught commiting a crime and fined ${cSymbol}${amount.toLocaleString()}`;
			amount *= -1;
		} else {
			amount = util.intInRange(min, max);
			color = 'GREEN';
			description = `You commited a crime and earned ${cSymbol}${amount.toLocaleString()}!`;
		}

		await util.transaction(
			guildID,
			userID,
			this.data.name,
			'`system`',
			amount,
			0,
			amount
		);

		await interaction.reply({
			embeds: [
				util.embedify(
					color,
					interaction.member.user.tag,
					interaction.member.user.displayAvatarURL(),
					description
				),
			],
		});
	},
};
