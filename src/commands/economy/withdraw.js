module.exports = {
	name: 'withdraw',
	group: 'economy',
	description: 'Withdraw funds from the treasury to your wallet.',
	global: true,
	format: '<amount | all>',
	options: [
		{
			name: 'amount',
			description: 'Specify the amount you wish to withdraw or "all".',
			type: 'STRING',
			required: true,
		},
	],
	async run(interaction) {
		let color = 'GREEN',
			description = '';

		const cSymbol = await util.getCurrencySymbol(interaction.guild.id);
		const { treasury } = await util.getEconInfo(
			interaction.guild.id,
			interaction.member.id
		);

		let amount =
			interaction.options.getString('amount') === 'all'
				? treasury
				: parseInt(interaction.options.getString('amount'));

		if (amount > treasury) amount = treasury;

		if (amount || amount === 0) {
			if (amount < 1) {
				color = 'RED';
				description = `Invalid amount: ${cSymbol}${amount.toLocaleString()}`;
			} else {
				description = `Withdrew ${cSymbol}${amount.toLocaleString()}`;
				await util.transaction(
					interaction.guild.id,
					interaction.member.id,
					this.name,
					'`system`',
					amount,
					-amount,
					0
				);
			}
		} else {
			color = 'RED';
			description = `Invalid amount: \`${amount}\`\nFormat: \`${this.name} ${this.format}\``;
		}

		return color == 'RED'
			? await interaction.reply(util.error(description))
			: await interaction.reply({
					embeds: [
						util.embedify(
							color,
							interaction.user.tag,
							interaction.user.displayAvatarURL(),
							description
						),
					],
			  });
	},
};
