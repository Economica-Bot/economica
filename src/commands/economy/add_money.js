const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add_money')
		.setDescription(commands.commands.add_money.description)
		.addUserOption((option) =>
			option.setName('user').setDescription('Specify a user.').setRequired(true)
		)
		.addIntegerOption((option) =>
			option
				.setName('amount')
				.setDescription('Specify the amount.')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('target')
				.setDescription('Specify the target of the funds.')
				.addChoices([
					['wallet', 'wallet'],
					['treasury', 'treasury'],
				])
				.setRequired(true)
		),
	async run(interaction) {
		const targetMember = interaction.options.getMember('user');

		let wallet = 0,
			treasury = 0,
			total = 0;
		const amount = interaction.options.getInteger('amount');

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
			`${this.data.name} | <@!${interaction.member.user.id}>`,
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
