module.exports = {
	name: 'deposit',
	group: 'economy',
	description: 'Deposit funds from your wallet to the treasury.',
	format: '<amount | all>',
	global: true,
	options: [
		{
			name: 'amount',
			description: 'Specify an amount to pay or "all".',
			type: 'STRING',
			required: true,
		},
	],
	async run(interaction) {
		let color = 'GREEN',
			description = '';
		const cSymbol = await util.getCurrencySymbol(interaction.guild.id);
		const { wallet } = await util.getEconInfo(
			interaction.guild.id,
			interaction.member.id
		);
		const amount =
			interaction.options.getString('amount') === 'all'
				? wallet
				: parseInt(interaction.options.getString('amount'));

		if (amount) {
			if (amount > wallet || amount < 1) {
				color = 'RED';
				description = `Invalid amount: ${cSymbol}${amount.toLocaleString()}\nCurrent wallet: ${cSymbol}${wallet.toLocaleString()}`;
			} else {
				description = `Deposited ${cSymbol}${amount.toLocaleString()}`;
				await util.transaction(
					interaction.guild.id,
					interaction.member.user.id,
					this.name,
					'`system`',
					-amount,
					amount,
					0
				);
			}
		} else {
			color = 'RED';
			description = `Invalid amount: \`${amount}\`\nFormat: \`${this.name} ${this.format}\``;
		}

		return color == "RED"? 
			await interaction.reply(util.error(description)) :
			await interaction.reply({
				embeds: [
					util.embedify(
						color,
						interaction.user.tag,
						interaction.member.user.displayAvatarURL(),
						description
					),
				],
			});
	},
};
