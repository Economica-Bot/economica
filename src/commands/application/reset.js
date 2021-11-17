const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset')
		.setDescription(commands.commands.reset.description)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('guild')
				.setDescription('Reset guild slash commands.')
				.addStringOption((option) =>
					option
						.setName('scope')
						.setDescription('Reset scope.')
						.addChoices([
							['This', 'this'],
							['All', 'all'],
						])
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('global')
				.setDescription('Reset global slash commands.')
		),
	async run(interaction) {
		await interaction.deferReply({ ephemeral: true });
		if (interaction.options.getSubcommand() === 'guild') {
			if (interaction.options.getString('scope') === 'this') {
				await interaction.guild.commands.set([]);
			} else {
				client.guilds.cache.forEach(async (guild) => {
					guild.commands.set([]);
				});
			}
		} else {
			await clientcommands.set([]);
		}

		const embed = util.embedify(
			'GREEN',
			interaction.member.user.tag,
			interaction.member.user.displayAvatarURL(),
			'`RESET ALL SLASH COMMANDS`',
			'Restart Required'
		);

		await interaction.editReply({ embeds: [embed], ephemeral: true });
	},
};
