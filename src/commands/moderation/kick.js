const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription(commands.commands.kick.description)
		.addUserOption((option) =>
			option.setName('user').setDescription('Specify a user.').setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('description').setDescription('Provide a reason.')
		),
	async run(interaction) {
		const targetMember = interaction.options.getMember('user');
		let embed = (result = null),
			ephemeral = false,
			reason = interaction.options.getString('reason') ?? 'No reason provided';

		if (targetMember.user.id === interaction.member.user.id) {
			embed = util.embedify(
				'RED',
				interaction.member.user.tag,
				interaction.member.user.displayAvatarURL(),
				'You cannot kick yourself!'
			);
			ephemeral = true;
		} else if (!targetMember.kickable) {
			embed = util.embedify(
				'RED',
				interaction.member.user.tag,
				interaction.member.user.displayAvatarURL(),
				`<@!${targetMember.user.id}> is not kickable.`
			);
			ephemeral = true;
		} else {
			//Kick, record, and send message
			await targetMember
				.send({
					embeds: [
						util.embedify(
							'RED',
							interaction.guild.name,
							interaction.guild.iconURL(),
							`You have been **kicked** for \`${reason}\`.`
						),
					],
				})
				.catch((err) => {
					result = `Could not dm ${targetMember.user.tag}.\n\`${err}\``;
				});

			embed = util.embedify(
				'GREEN',
				`Kicked ${targetMember.user.tag}`,
				targetMember.user.displayAvatarURL(),
				`**Reason**: \`${reason}\``,
				result ? result : targetMember.user.id
			);

			targetMember.kick({
				reason,
			});

			await util.infraction(
				interaction.guild.id,
				targetMember.id,
				interaction.member.user.id,
				this.data.name,
				reason
			);
		}

		await interaction.reply({ embeds: [embed], ephemeral });
	},
};
