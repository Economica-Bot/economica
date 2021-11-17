const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deposit')
		.setDescription(commands.commands.deposit.description)
		.addIntegerOption((option) =>
			option
				.setName('amount')
				.setDescription('Specify the amount you wish to deposit.')
				.setRequired(true)
		),
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
			if (amount < 1 || amount > wallet) {
				color = 'RED';
				description = `Insufficient wallet: ${cSymbol}${amount.toLocaleString()}\nCurrent wallet: ${cSymbol}${wallet.toLocaleString()}`;
			} else {
				description = `Deposited ${cSymbol}${amount.toLocaleString()}`;
				await util.transaction(
					interaction.guild.id,
					interaction.member.user.id,
					this.data.name,
					'`system`',
					-amount,
					amount,
					0
				);
			}
		} else {
			color = 'RED';
			description = `Invalid amount: \`${amount}\``;
		}

		await interaction.reply({
			embeds: [
				util.embedify(
					color,
					interaction.member.user.tag,
					interaction.member.user.displayAvatarURL(),
					description
				),
			],
		});
	},
};
