const infractionSchema = require('@schemas/infraction-sch');

module.exports = {
	name: 'unmute',
	group: 'moderation',
	description: 'Unmute a user.',
	format: '<user>',
	global: true,
	userPermissions: ['MUTE_MEMBERS'],
	clientPermissions: ['MANAGE_ROLES'],
	roles: [
		{
			name: 'MUTED',
			required: false,
		},
	],
	options: [
		{
			name: 'user',
			description: 'Specify a user to unmute.',
			type: 'USER',
			required: true,
		},
	],
	async run(interaction) {
		const targetMember = interaction.options.getMember('user');

		//Remove muted role
		const mutedRole = guild.roles.cache.find((role) => {
			return role.name.toLowerCase() === 'muted';
		});

		const clientMember = await interaction.guild.members.cache.get(
			client.user.id
		);

		if (clientMember.roles.highest.position < mutedRole.position) {
			interaction.reply({
				embeds: [
					util.embedify(
						'RED',
						interaction.member.user.tag,
						interaction.member.user.displayAvatarURL(),
						`The ${mutedRole} role is above my highest role!`
					),
				],
			});

			return;
		}

		targetMember.roles.remove(mutedRole);

		//Check if there is an active mute
		const activeMutes = await infractionSchema.find({
			userID: targetMember.id,
			guildID: interaction.guild.id,
			type: 'mute',
			active: true,
		});

		if (!activeMutes.length) {
			interaction.reply({
				embeds: [
					util.embedify(
						'RED',
						targetMember.user.tag,
						targetMember.user.displayAvatarURL(),
						`Could not find any active mutes for this user.`,
						targetMember.user.id
					),
				],
			});

			return;
		}

		await interaction.reply({
			embeds: [
				util.embedify(
					'GREEN',
					interaction.guild.name,
					interaction.guild.iconURL(),
					`Unmuted <@!${targetMember.user.id}>`
				),
			],
		});

		await infractionSchema.updateMany(
			{
				userID: targetMember.id,
				guildID: interaction.guild.id,
				type: 'mute',
				active: true,
			},
			{
				active: false,
			}
		);
	},
};
