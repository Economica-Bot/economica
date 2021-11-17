const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');
const path = require('path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('load')
		.setDescription(commands.commands.load.description)
		.addStringOption((option) =>
			option
				.setName('command')
				.setDescription('Specify a command.')
				.setRequired(true)
		),
	async run(interaction) {
		const commandName = interaction.options.getString('command');
		const command = client.commands.get(commandName);
		if (command) {
			const cmd = require(path.join(
				__dirname,
				`../../commands/${command.group}/${command.name}.js`
			));
			await client.guilds.fetch(process.env.GUILD_ID).commands.create(cmd);
			client.commands.set(cmd.name, cmd);
			const embed = util.embedify(
				'GREEN',
				interaction.member.user.tag,
				interaction.member.user.displayAvatarURL(),
				`Force loaded \`${cmd.name}\``
			);

			await interaction.reply({ embeds: [embed], ephemeral: true });
		} else {
			const embed = util.embedify(
				'RED',
				interaction.member.user.tag,
				interaction.member.user.displayAvatarURL(),
				`Command \`${commandName}\` not found.`
			);

			await interaction.reply({ embeds: [embed], ephemeral: true });
		}
	},
};
