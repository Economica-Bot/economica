module.exports = {
	name: 'add-money',
	description: 'Add money.',
	group: 'economy',
	global: true,
	roles: [
		{
			name: 'ECONOMY MANAGER',
			required: true,
		},
	],
	options: [
		{
			name: 'user',
			description: 'Specify a user.',
			type: 'USER',
			required: true,
		},
		{
			name: 'amount',
			description: 'Specify the amount you wish to withdraw.',
			type: 'STRING',
			required: true,
		},
		{
			name: 'target',
			description: 'Specify where the money is added.',
			type: 'STRING',
			choices: [
				{
					name: 'wallet',
					value: 'wallet',
				},
				{
					name: 'treasury',
					value: 'treasury',
				},
			],
			required: true,
		},
	],
	async run(interaction) {
		const targetMember = interaction.options.getMember('user');

		let wallet = 0,
			treasury = 0,
			total = 0;
		const amount =
			interaction.options.getString('amount') === 'all'
				? treasury
				: parseInt(interaction.options.getString('amount'));

		if (interaction.options.getString('target') === 'treasury') {
			treasury += amount;
		} else {
			wallet += amount;
		}

		total += amount;

		await util.transaction(
			interaction.guild.id,
			targetMember.user.id,
			'ADD_MONEY',
			`add-money | <@!${interaction.member.user.id}>`,
			wallet,
			treasury,
			total
		);

		interaction.reply({
			embeds: [
				util.embedify(
					'GREEN',
					targetMember.user.tag,
					targetMember.user.displayAvatarURL(),
					`Added ${await util.getCurrencySymbol(
						interaction.guild.id
					)}${amount.toLocaleString()} to <@!${
						targetMember.user.id
					}>'s \`${interaction.options.getString('target')}\``
				),
			],
		});
	},
};
