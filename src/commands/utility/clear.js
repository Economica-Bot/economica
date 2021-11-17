const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription(commands.commands.clear.description)
		.addChannelOption((option) =>
			option.setName('channel').setDescription('Specify a channel.')
		)
		.addIntegerOption((option) =>
			option
				.setName('msgcount')
				.setDescription(
					'Specify the amount of messages to delete between 0 and 100.'
				)
		),
	async run(interaction) {
		const channel =
			interaction.options.getChannel('channel') ?? interaction.channel;
		const msgCount = interaction.options.getNumber('msgCount') ?? 100;
		if (msgCount > 100 || msgCount < 0) {
			await interaction.reply({
				embeds: [
					util.embedify(
						'RED',
						interaction.member.user.tag,
						interaction.member.user.displayAvatarURL(),
						`Invalid Length: \`${msgCount}\` out of bounds.`
					),
				],
				ephemeral: true,
			});
		} else {
			await channel.bulkDelete(msgCount, true).then(async (val) => {
				await interaction.reply({
					embeds: [
						util.embedify(
							'GREEN',
							interaction.member.user.tag,
							interaction.member.user.displayAvatarURL(),
							`Deleted \`${val.size}\` messages.`
						),
					],
					ephemeral: true,
				});
			});
		}
	},
};
