module.exports = {
	name: 'balance',
	group: 'economy',
	description: 'View a balance.',
	format: '[user]',
	global: true,
	options: [
		{
			name: 'user',
			description: 'Name a user you wish to see the balance of.',
			type: 'USER',
		},
	],
	async run(interaction) {
		const user = interaction.options.getUser('user') ?? interaction.member.user;

		const cSymbol = await util.getCurrencySymbol(interaction.guild.id);
		const { wallet, treasury, total, rank } = await util.getEconInfo(
			interaction.guild.id,
			user.id
		);
		const balEmbed = util
			.embedify(
				'GOLD',
				user.tag,
				user.displayAvatarURL(),
				'',
				`🏆 Rank ${rank}`
			)
			.addFields([
				{
					name: 'Wallet',
					value: `${cSymbol}${wallet.toLocaleString()}`,
					inline: true,
				},
				{
					name: 'Treasury',
					value: `${cSymbol}${treasury.toLocaleString()}`,
					inline: true,
				},
				{
					name: 'Total',
					value: `${cSymbol}${total.toLocaleString()}`,
					inline: true,
				},
			]);

		await interaction.reply({ embeds: [balEmbed] });
	},
};
