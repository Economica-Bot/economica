const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription(commands.commands.ban.description)
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

		if (targetMember.user.id === interaction.member.user.id) {
			embed = util.embedify(
				'RED',
				interaction.member.user.tag,
				interaction.member.user.displayAvatarURL(),
				'You cannot ban yourself!'
			);
			ephemeral = true;
		} else if (!targetMember.bannable) {
			embed = util.embedify(
				'RED',
				interaction.member.user.tag,
				interaction.member.user.displayAvatarURL(),
				`<@!${targetMember.user.id}> is not bannable.`
			);
			ephemeral = true;
		} else {
			//Ban, record, and send message
			await targetMember
				.send({
					embeds: [
						util.embedify(
							'RED',
							interaction.guild.name,
							interaction.guild.iconURL(),
							`You have been **banned** for \`${reason}\`.`
						),
					],
				})
				.catch((err) => {
					result = `Could not dm ${targetMember.user.tag}.\n\`${err}\``;
				});

			embed = util.embedify(
				'GREEN',
				`Banned ${targetMember.user.tag}`,
				targetMember.user.displayAvatarURL(),
				`**Reason**: \`${reason}\``,
				result ? result : targetMember.user.id
			);

			targetMember.ban({
				reason,
			});

			await util.infraction(
				interaction.guild.id,
				targetMember.id,
				interaction.member.user.id,
				this.data.name,
				reason,
				true
			);
		}

		await interaction.reply({
			embeds: [embed],
			ephemeral,
		});
	},
};
