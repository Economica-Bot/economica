const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('beg')
		.setDescription(commands.commands.beg.description),
	async run(interaction) {
		const guildID = interaction.guild.id,
			userID = interaction.member.id;
		const properties = await util.getCommandStats(guildID, this.data.name);

		let color, description;
		if (!util.isSuccess(properties)) {
			color = 'RED';
			description = 'You begged and received nothing. :slight_frown:';
		} else {
			const { min, max } = properties;
			const amount = util.intInRange(min, max);
			await util.transaction(
				guildID,
				userID,
				this.data.name,
				'`system`',
				amount,
				0,
				amount
			);
			const cSymbol = await util.getCurrencySymbol(guildID);
			color = 'GREEN';
			description = `You begged and earned ${cSymbol}${amount.toLocaleString()}!`;
		}

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
