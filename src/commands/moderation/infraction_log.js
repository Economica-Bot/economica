const guildSettingSchema = require('@schemas/guild-settings-sch');

module.exports = {
	name: 'infraction_log',
	group: 'moderation',
	description: 'Manage the infraction logging channel.',
	format: '<set | remove> [channel]',
	global: true,
	permissions: ['MANAGE_CHANNELS'],
	options: [
		{
			name: 'set',
			description: 'Set the infraction log.',
			type: 'SUB_COMMAND',
			options: [
				{
					name: 'channel',
					description: 'Specify a channel.',
					type: 'CHANNEL',
					required: true,
				},
			],
		},
		{
			name: 'remove',
			description: 'Remove the infraction log.',
			type: 'SUB_COMMAND',
			options: null,
		},
	],
	async run(interaction) {
		let color, description;
		if (interaction.options.getSubcommand() === 'set') {
			const channel = interaction.options.getChannel('channel');
			if (!channel.isText()) {
				color = 'RED';
				description = `\`${channel.name}\` is not a text channel.`;
			} else {
				await guildSettingSchema
					.findOneAndUpdate(
						{
							guildID: interaction.guild.id,
						},
						{
							infractionLogChannel: channel.id,
						},
						{
							upsert: true,
							new: true,
						}
					)
					.then(() => {
						color = 'GREEN';
						description = `Infraction log set to <#${channel.id}>`;
					});
			}
		} else if (interaction.options.getSubcommand() === 'remove') {
			await guildSettingSchema
				.findOneAndUpdate(
					{
						guildID: interaction.guild.id,
					},
					{
						$unset: {
							infractionLogChannel: '',
						},
					}
				)
				.then(() => {
					color = 'GREEN';
					description = `Removed infraction log.`;
				});
		}

		await interaction.reply({
			embeds: [
				util.embedify(
					color,
					interaction.guild.name,
					interaction.guild.iconURL(),
					description
				),
			],
		});
	},
};
