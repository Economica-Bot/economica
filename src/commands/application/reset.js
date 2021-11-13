module.exports = {
	name: 'reset',
	group: 'application',
	description: 'Resets slash commands.',
	global: true,
	options: [
		{
			name: 'guild',
			description: 'Reset guilds slash commands.',
			type: 1,
			options: [
				{
					name: 'scope',
					description: 'Reset scope.',
					type: 3,
					choices: [
						{
							name: 'This',
							value: 'this',
						},
						{
							name: 'All',
							value: 'all',
						},
					],
					required: true,
				},
			],
		},
		{
			name: 'global',
			description: 'Reset global slash commands.',
			type: 1,
		},
	],
	ownerOnly: true,
	async run(interaction) {
		await interaction.deferReply({ ephemeral: true });
		if (interaction.options.getSubcommand() === 'guild') {
			if (interaction.options.getString('scope') === 'this') {
				await interaction.guild.commands.set([]);
			} else {
				client.guilds.cache.forEach(async (guild) => {
					guild.commands.set([]);
				});
			}
		} else {
			await client.application.commands.set([]);
		}

		const embed = util.embedify(
			'GREEN',
			interaction.member.user.tag,
			interaction.member.user.displayAvatarURL(),
			'`RESET ALL SLASH COMMANDS`',
			'Restart Required'
		);

		await interaction.editReply({ embeds: [embed], ephemeral: true });
	},
};
