const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription(commands.commands.ping.description),
	async run(interaction) {
		await interaction.reply({
			embeds: [
				util.embedify(
					'GREEN',
					interaction.user.tag,
					interaction.user.displayAvatarURL(),
					`Pong! \`${client.ws.ping}ms\``
				),
			],
		});
	},
};
