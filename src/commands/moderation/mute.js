const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

const ms = require('ms');

const infractionSchema = require('../../util/mongo/schemas/infraction-sch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription(commands.commands.mute.description)
		.addUserOption((option) =>
			option.setName('user').setDescription('Specify a user.').setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('duration').setDescription('Specify a duration.')
		)
		.addStringOption((option) =>
			option.setName('reason').setDescription('Specify a reason.')
		),
	async run(interaction) {
		const targetMember = interaction.options.getUser('user');
		let reason,
			duration,
			expires,
			ephemeral = false,
			permanent = true,
			exit = false,
			color = 'BLURPLE',
			title = interaction.member.user.tag,
			icon_url = interaction.member.user.displayAvatarURL(),
			description = '',
			footer = '';

		const mutedRole = interaction.guild.roles.cache.find((role) => {
			return role.name.toLowerCase() === 'muted';
		});

		const clientMember = await interaction.guild.members.cache.get(
			client.user.id
		);

		if (clientMember.roles.highest.position < mutedRole.position) {
			color = 'RED';
			description = `The ${mutedRole} role is above my highest role!`;
			exit = true;
		} else {
			if (targetMember.user.id === member.user.id) {
				color = 'RED';
				description = 'You cannot mute yourself!';
				ephemeral = true;
				exit = true;
			}

			reason = interaction.options.getString('reason') ?? 'No reason provided';

			if (interaction.options.getString('duration')) {
				duration = ms(interaction.option.getString('duration'));
				if (duration) {
					if (duration < 0) {
						color = 'RED';
						description += `Invalid duration: \`${option.value}\`\nDuration must be more than \`0\`.\n`;
						ephemeral = true;
						exit = true;
					} else {
						expires = new Date(new Date().getTime() + duration);
						permanent = false;
					}
				} else {
					color = 'RED';
					description += `Invalid duration: \`${option.value}\`\nExamples: \`\`\`2 hours\n1h\n1m\n20m10s\n100\`\`\`\n`;
					footer = 'Number is measured in ms';
					ephemeral = true;
					exit = true;
				}
			}
		}

		if (!exit) {
			//Check for active mute
			const activeMutes = await infractionSchema.find({
				guildID: interaction.guild.id,
				userID: targetMember.id,
				type: this.data.name,
				active: true,
			});

			if (activeMutes.length) {
				color = 'RED';
				title = interaction.member.user.tag;
				icon_url = interaction.member.user.displayAvatarURL();
				description += 'This user is already `muted`!\n';
			} else {
				//Mute, record, and send message
				await targetMember
					.send({
						embeds: [
							util.embedify(
								'RED',
								guild.name,
								guild.iconURL(),
								`You have been **muted** ${
									duration ? `for ${ms(duration)}` : 'permanently.'
								}\nReason: \`${reason}\``
							),
						],
					})
					.catch((err) => {
						footer = `Could not dm ${targetMember.user.tag}.\n\`${err}\`\n`;
					});

				targetMember.roles.add(mutedRole);

				await util.infraction(
					guild.id,
					targetMember.id,
					interaction.member.id,
					this.data.name,
					reason,
					permanent,
					true,
					expires
				);

				color = 'GREEN';
				title = `Muted ${member.user.tag}`;
				icon_url = member.user.displayAvatarURL();
				description += `**Duration**: \`${
					duration ? `${ms(duration)}` : 'permanent'
				}\`\n**Reason**: \`${reason}\``;
				footer ?? member.user.id;
			}
		}

		const embed = util.embedify(
			color,
			title,
			icon_url,
			description,
			footer ?? targetMember.id
		);

		await interaction.reply({
			embeds: [embed],
			ephemeral,
		});
	},
};
