module.exports = {
	name: 'kick',
	group: 'moderation',
	description: 'Kicks a user',
	global: true,
	userPermissions: ['KICK_MEMBERS'],
	clientPermissions: ['KICK_MEMBERS'],
	options: [
		{
			name: 'user',
			description: 'Name a user you wish to kick.',
			type: 'USER',
			required: true,
		},
		{
			name: 'reason',
			description: 'Provide a reason.',
			type: 'STRING',
		},
	],
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
				this.name,
				reason
			);
		}

		await interaction.reply({ embeds: [embed], ephemeral });
	},
};
