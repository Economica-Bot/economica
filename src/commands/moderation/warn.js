const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription(commands.commands.warn.description)
		.addUserOption((option) =>
			option.setName('user').setDescription('Specify a user.').setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('reason').setDescription('Specify a reason.')
		),
	async run(interaction) {
		const targetMember = interaction.options.getMember('user');
		let embed = (result = null),
			ephemeral = false,
			reason = interaction.options.getString('reason') ?? 'No reason provided';

		if (targetMember.id === interaction.member.id) {
			embed = util.embedify(
				'RED',
				interaction.member.user.tag,
				interaction.member.user.displayAvatarURL(),
				'You cannot warn yourself!'
			);
			ephemeral = true;
		} else {
			//Warn, record, and send message
			await targetMember
				.send({
					embeds: [
						util.embedify(
							'RED',
							interaction.guild.name,
							interaction.guild.iconURL(),
							`You have been **warned** for \`${reason}\`.`
						),
					],
				})
				.catch((err) => {
					result = `Could not dm ${targetMember.user.tag}.\n\`${err}\``;
				});

			embed = util.embedify(
				'GREEN',
				`Warned ${targetMember.user.tag}`,
				targetMember.user.displayAvatarURL(),
				`**Reason**: \`${reason}\``,
				result ? result : targetMember.id
			);

			await util.infraction(
				interaction.guild.id,
				targetMember.id,
				interaction.member.id,
				this.data.name,
				reason
			);
		}

		await interaction.reply({ embeds: [embed], ephemeral });
	},
};
