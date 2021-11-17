const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription(commands.commands.invite.description),
	async run(interaction) {
		await interaction.reply({
			embeds: [
				util.embedify(
					'GOLD',
					client.user.tag,
					client.user.displayAvatarURL(),
					`Invite link: __[Click Here](${process.env.INVITE_LINK} 'Invite Economica')__`
				),
			],
		});
	},
};
