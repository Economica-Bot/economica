module.exports = {
	name: 'servers',
	group: 'utility',
	description: `Get information about ${client.user.tag}'s servers`,
	global: true,
	options: null,
	async run(interaction) {
		let serverCount = 0,
			memberCount = 0;
		client.guilds.cache.forEach((guild) => {
			serverCount++;
			memberCount += guild.memberCount;
		});

		const embed = util.embedify(
			'GREEN',
			`Economica's Servers`,
			client.user.displayAvatarURL(),
			`Server Count: \`${serverCount}\` | Member Count: \`${memberCount}\``
		);

		await interaction.reply({ embeds: [embed] });
	},
};
