const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('servers')
		.setDescription(commands.commands.servers.description),
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
