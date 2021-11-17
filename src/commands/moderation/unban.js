const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

const infractionSchema = require('../../util/mongo/schemas/infraction-sch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription(commands.commands.unban.description)
		.addStringOption((option) =>
			option
				.setName('user_id')
				.setDescription('Specify a user ID.')
				.setRequired(true)
		),
	async run(interaction) {
		const userID = interaction.options.getString('user_id');
		const guildBan = (await guild.bans.fetch()).get(userID);

		if (!guildBan) {
			interaction.reply({
				embeds: [
					util.embedify(
						'RED',
						interaction.guild.name,
						interaction.guild.iconURL(),
						`Could not find banned user with ID \`${userID}\`.`
					),
				],
			});

			return;
		}

		interaction.reply({
			embeds: [
				util.embedify(
					'GREEN',
					interaction.guild.name,
					interaction.guild.iconURL(),
					`Unbanned \`${userID}\`.`
				),
			],
		});

		interaction.guild.members.unban(userID);

		await infractionSchema.updateMany(
			{
				guildID: interaction.guild.id,
				userID,
				type: 'ban',
				active: true,
			},
			{
				active: false,
			}
		);
	},
};
