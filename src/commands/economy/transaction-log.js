const guildSettingSchema = require('@schemas/guild-settings-sch');

module.exports = {
	name: 'transaction-log',
	group: 'economy',
	description: 'Manage the transaction logging channel.',
	format: '<set | remove> [channel]',
	global: true,
	userPermissions: ['MANAGE_CHANNELS'],
	options: [
		{
			name: 'set',
			description: 'Set the transaction log.',
			type: 'SUB_COMMAND',
			options: [
				{
					name: 'channel',
					description: 'Specify a channel.',
					type: 'CHANNEL',
					required: true,
					channel_types: [0],
				},
			],
		},
		{
			name: 'remove',
			description: 'Remove the transaction log.',
			type: 'SUB_COMMAND',
			options: null,
		},
	],
	async run(interaction) {
		let color, description;
		if (interaction.options.getSubcommand() == 'set') {
			const channel = interaction.options.getChannel('channel');
			await guildSettingSchema
				.findOneAndUpdate(
					{
						guildID: interaction.guild.id,
					},
					{
						transactionLogChannel: channel.id,
					},
					{
						upsert: true,
						new: true,
					}
				)
				.then(() => {
					color = 'GREEN';
					description = `Transaction log set to <#${channel.id}>`;
				});
		} else if (interaction.options.getSubcommand() === 'remove') {
			await guildSettingSchema
				.findOneAndUpdate(
					{
						guildID: interaction.guild.id,
					},
					{
						$unset: {
							transactionLogChannel: '',
						},
					}
				)
				.then(() => {
					color = 'GREEN';
					description = `Removed transaction log.`;
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
