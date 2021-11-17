const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription(commands.commands.help.description)
		.addStringOption((option) =>
			option.setName('command').setDescription('Specify a command.')
		),
	async run(interaction) {
		const command = interaction.options.getString('command');
		let embed;

		if (!command) {
			embed = util.embedify(
				'YELLOW',
				`${client.user.tag} Commands`,
				client.user.displayAvatarURL()
			);

			const commandList = [];
			for (const command in commands.commands) {
				commandList.push(command);
			}

			embed.setDescription(`\`${commandList.join('`, `')}\``);
		} else if (command) {
			let found = false;
			for (const cmd in commands.commands) {
				if (cmd === command) {
					found = true;
				}
			}

			if (found) {
				embed = util.embedify(
					'YELLOW',
					`${command}`,
					client.user.displayAvatarURL(),
					`>>> *${
						commands.commands[command].description
					}* \n${`Usage: \`${command} ${commands.commands[command].usage}\``}`
				);
			} else {
				embed = util.embedify(
					'RED',
					interaction.member.user.tag,
					interaction.member.user.displayAvatarURL(),
					`Command \`${command}\` not found`
				);
			}
		}

		await interaction.reply({ embeds: [embed], ephemeral: true });
	},
};
