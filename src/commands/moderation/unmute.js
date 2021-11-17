const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

const infractionSchema = require('../../util/mongo/schemas/infraction-sch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unmute')
		.setDescription(commands.commands.unmute.description)
		.addUserOption((option) =>
			option
				.setName('option')
				.setDescription('Specify a user.')
				.setRequired(true)
		),
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
