const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

const infractionSchema = require('../../util/mongo/schemas/infraction-sch');

const { isValidObjectId } = require('mongoose');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('infractions')
		.setDescription(commands.commands.infraction_log.description)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('view')
				.setDescription('View infractions.')
				.addUserOption((option) =>
					option.setName('user').setDescription('Specify a user.')
				)
				.addStringOption((option) =>
					option
						.setName('infraction_id')
						.setDescription('Specify an infraction.')
				)
		),
	async run(interaction) {
		await interaction.deferReply();

		const targetMember = interaction.options.getMember('user');
		const _id = interaction.options.getString('infraction_id');
		if (!isValidObjectId(_id)) {
			interaction.editReply({
				embeds: [
					util.embedify(
						'RED',
						interaction.member.user.tag,
						interaction.member.user.displayAvatarURL(),
						`Invalid loan ID: \`${_id}\``
					),
				],
			});
			return;
		}

		//find latest infraction data
		const infractions = await infractionSchema
			.find({
				guildID: interaction.guild.id,
				userID: targetMember.user.id,
			})
			.sort({
				createdAt: -1,
			});

		//Array of format objects
		const infractionTypes = [
			{
				type: 'warn',
				formal: 'Warned',
				logo: 'Warns ⚠️',
				had: false,
			},
			{
				type: 'mute',
				formal: 'Muted',
				logo: 'Mutes 🎤',
				had: false,
			},
			{
				type: 'kick',
				formal: 'Kicked',
				logo: 'Kicks 👢',
				had: false,
			},
			{
				type: 'ban',
				formal: 'Banned',
				logo: 'Bans 🔨',
				had: false,
			},
		];

		let infractionEmbed = util.embedify(
			'BLURPLE',
			`${targetMember.user.tag}'s Infractions`,
			targetMember.user.displayAvatarURL(),
			'',
			`Server Member | Joined ${new Date(
				targetMember.joinedTimestamp
			).toLocaleString()}`
		);

		//View single infraction
		if (_id) {
			const infraction = await infractionSchema.findOne({ _id });
			if (infraction) {
				infractionEmbed.description = `Infraction \`${_id}\`\n${
					infractionTypes.find((inf) => inf.type === infraction.type).formal
				} by <@!${infraction.staffID}> for \`${infraction.reason}\` ${
					infraction.type === 'mute'
						? `| ${
								infraction.permanent
									? '**Permanent**'
									: `Expires <t:${infraction.expires.getMilliseconds()}:R>`
						  }`
						: ''
				}\n`;
			} else {
				infractionEmbed.description = `Could not find infraction \`${_id}\``;
			}

			await interaction.editReply({ embeds: [infractionEmbed] });
		}

		//View all infractions
		else {
			const row = new Discord.MessageActionRow();

			for (const infraction of infractions) {
				if (infraction.type === 'warn') {
					const warn = infractionTypes.find((obj) => obj.type === 'warn');
					warn.had = true;
				} else if (infraction.type === 'mute') {
					const mute = infractionTypes.find((obj) => obj.type === 'mute');
					mute.had = true;
					if (infraction.active) {
						infractionEmbed.addField(
							`Currently **Muted**`,
							`\`${infraction.reason}\``
						);
					}
				} else if (infraction.type === 'kick') {
					const kick = infractionTypes.find((obj) => obj.type === 'kick');
					kick.had = true;
				} else if (infraction.type === 'ban') {
					const ban = infractionTypes.find((obj) => obj.type === 'ban');
					ban.had = true;
					if (infraction.active) {
						infractionEmbed.addField(
							`Currently **Banned**`,
							`\`${infraction.reason}\``
						);
					}
				}
			}

			let description = '';
			for (const infractionType of infractionTypes) {
				description += `**${infractionType.formal}** \`${
					infractions.filter(
						(infraction) => infraction.type === infractionType.type
					).length
				}\` times\n`;
				row.addComponents(
					new Discord.MessageButton()
						.setCustomId(`${infractionType.type}`)
						.setLabel(`${infractionType.logo}`)
						.setStyle(4)
						.setDisabled(!infractionType.had)
				);
			}

			infractionEmbed.setDescription(description);

			const msg = await interaction.editReply({
				embeds: [infractionEmbed],
				components: [row],
			});

			client.on('interactionCreate', async (interaction) => {
				if (
					interaction.isButton() &&
					interaction.message.id === msg.id &&
					interaction.user.id === interaction.user.id
				) {
					let title = '',
						description = '';
					infractions.forEach((infraction) => {
						if (infraction.type === interaction.customId) {
							const infractionType = infractionTypes.filter(
								(infractionType) => infractionType.type === infraction.type
							)[0];
							title = infractionType.logo;
							description += `Infraction \`${infraction._id}\`\n${
								infractionType.formal
							} by <@!${infraction.staffID}> for \`${infraction.reason}\` ${
								infraction.type === 'mute'
									? `| ${
											infraction.permanent
												? '**Permanent**'
												: `Expires <t:${infraction.expires.getMilliseconds()}:R>`
									  }`
									: ''
							}\n\n`;
						}
					});

					const specEmbed = util.embedify(
						'BLURPLE',
						`${targetMember.user.tag} | ${title}`,
						targetMember.user.displayAvatarURL(),
						description
					);

					await interaction.update({
						embeds: [specEmbed],
					});
				}
			});
		}
	},
};
