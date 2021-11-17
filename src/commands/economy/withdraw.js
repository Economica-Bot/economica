const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('withdraw')
		.setDescription(commands.commands.withdraw.description)
		.addStringOption((option) =>
			option
				.setName('amount')
				.setDescription('Specify the amount.')
				.setRequired(true)
		),
	async run(interaction) {
		let color = 'GREEN',
			description = '';

		const cSymbol = await util.getCurrencySymbol(interaction.guild.id);
		const { treasury } = await util.getEconInfo(
			interaction.guild.id,
			interaction.member.id
		);
		const amount =
			interaction.options.getString('amount') === 'all'
				? treasury
				: parseInt(interaction.options.getString('amount'));

		if (amount || amount === 0) {
			if (amount < 1 || amount > treasury) {
				color = 'RED';
				description = `Insufficient treasury: ${cSymbol}${amount.toLocaleString()}\nCurrent treasury: ${cSymbol}${treasury.toLocaleString()}`;
			} else {
				description = `Withdrew ${cSymbol}${amount.toLocaleString()}`;
				await util.transaction(
					interaction.guild.id,
					interaction.member.id,
					this.data.name,
					'`system`',
					amount,
					-amount,
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
					interaction.user.tag,
					interaction.member.user.displayAvatarURL(),
					description
				),
			],
		});
	},
};
