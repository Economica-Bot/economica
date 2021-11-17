const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coinflip')
		.setDescription(commands.commands.coinflip.description)
		.addStringOption((option) =>
			option
				.setName('amount')
				.setDescription('Specify the amount.')
				.setRequired(true)
		),
	name: 'coinflip',
	group: 'income',
	description: 'Double the money in your wallet by flipping a coin.',
	global: true,
	format: '<amount | all>',
	options: [
		{
			name: 'amount',
			description: 'Specify the amount you wish to withdraw.',
			type: 'STRING',
			required: true,
		},
	],
	async run(interaction) {
		const properties = await util.getCommandStats(
			interaction.guild.id,
			this.data.name
		);
		const { wallet } = await util.getEconInfo(
			interaction.guild.id,
			interaction.member.id
		);
		let color = 'RED',
			description = '';
		let amount =
			interaction.options.getString('amount') === 'all'
				? wallet
				: parseInt(interaction.options.getString('amount'));
		const cSymbol = await util.getCurrencySymbol(interaction.guild.id);
		if (wallet < 1 || wallet < amount) {
			description = `Insufficient wallet: ${cSymbol}${wallet.toLocaleString()}`;
		} else if (amount < 1) {
			description = `Invalid amount, must be above 0.`;
		} else {
			if (!util.isSuccess(properties)) {
				description = `You flipped a coin and lost ${cSymbol}${amount.toLocaleString()}`;
				amount = -amount;
			} else {
				color = 'GREEN';
				description = `You flipped a coin and earned ${cSymbol}${amount.toLocaleString()}`;
			}

			util.transaction(
				interaction.guild.id,
				interaction.member.id,
				this.data.name,
				'`system`',
				amount,
				0,
				amount
			);
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
