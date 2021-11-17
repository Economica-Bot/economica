const guildSettingSchema = require('../../util/mongo/schemas/guild-settings-sch');
const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('currency')
		.setDescription(commands.commands.currency.description)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('set')
				.setDescription('Set the currency symbol.')
				.addIntegerOption((option) =>
					option
						.setName('symbol')
						.setDescription('Specify a symbol.')
						.setRequired(true)
				)
				.setName('reset')
				.setDescription('Reset the currency symbol.')
		),
	async run(interaction) {
		let color, description, footer;
		if (interaction.options.getSubcommand() === 'set') {
			const currency = interaction.options.getString('symbol');
			await guildSettingSchema
				.findOneAndUpdate(
					{
						guildID: interaction.guild.id,
					},
					{
						currency,
					},
					{
						upsert: true,
						new: true,
					}
				)
				.then(() => {
					color = 'GREEN';
					description = `Currency symbol set to ${currency}`;
					footer = currency;
				});
		} else if (interaction.options.getSubcommand() === 'reset') {
			await guildSettingSchema
				.findOneAndUpdate(
					{
						guildID: interaction.guild.id,
					},
					{
						$unset: {
							currency: '',
						},
					}
				)
				.then(() => {
					color = 'GREEN';
					description = 'Reset the currency symbol.';
				});
		}

		const embed = util.embedify(
			color,
			interaction.guild.name,
			interaction.guild.iconURL(),
			description,
			footer
		);

		await interaction.reply({ embeds: [embed] });
	},
};
