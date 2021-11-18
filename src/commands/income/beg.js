module.exports = {
	name: 'beg',
	group: 'income',
	description: 'Get some quick cash.',
	global: true,
	options: null,
	async run(interaction) {
		const guildID = interaction.guild.id,
			userID = interaction.member.id;
		const properties = await util.getCommandStats(guildID, this.name);

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
				this.name,
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
