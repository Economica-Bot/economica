module.exports = {
	name: 'clear',
	group: 'utility',
	format: '[msgcount]',
	description:
		'Deletes a number of messages in a channel. If not specified, deletes all messages <= 2 weeks old.',
	global: true,
	userPermissions: ['MANAGE_MESSAGES'],
	clientPermissions: ['MANAGE_MESSAGES'],
	options: [
		{
			name: 'channel',
			description: 'Select a channel.',
			type: 'CHANNEL',
			required: false,
			channel_types: [0],
		},
		{
			name: 'msgcount',
			description: 'The amount of messages to delete.',
			type: 'NUMBER',
			required: false,
			min_value: 1,
			max_value: 100,
		},
	],
	async run(interaction) {
		const channel =
			interaction.options.getChannel('channel') ?? interaction.channel;
		const msgCount = interaction.options.getNumber('msgCount') ?? 100;
		await channel.bulkDelete(msgCount, true).then(async (val) => {
			await interaction.reply({
				embeds: [
					util.embedify(
						'GREEN',
						interaction.member.user.tag,
						interaction.member.user.displayAvatarURL(),
						`Deleted \`${val.size}\` messages.`
					),
				],
				ephemeral: true,
			});
		});
	},
};
