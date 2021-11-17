const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('initialize')
		.setDescription(commands.commands.initialize.description),
	async run(interaction) {
		const settings = await util.initGuildSettings(interaction.guild);
		return await interaction.reply(
			`Init \`\`\`${settings[0].toString()}\n\n${settings[1].toString()}\`\`\``
		);
	},
};
