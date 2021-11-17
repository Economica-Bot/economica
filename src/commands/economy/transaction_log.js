const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

const guildSettingSchema = require('../../util/mongo/schemas/guild-settings-sch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('transaction_log')
		.setDescription(commands.commands.transaction_log.description)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('set')
				.setDescription('Set the transaction log.')
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('Specify a channel.')
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName('remove').setDescription('Remove the transaction log.')
		),
	async run(interaction) {
		let color, description;
		if (interaction.options.getSubcommand() == 'set') {
			const channel = interaction.options.getChannel('channel');
			if (!channel.isText()) {
				color = 'RED';
				description = `\`${channel.name}\` is not a text channel.`;
			} else {
				await guildSettingSchema
					.findOneAndUpdate(
						{
							guildID: interaction.guild.id,
						},
						{
							transactionLogChannel: channel.id,
						},
						{
							upsert: true,
							new: true,
						}
					)
					.then(() => {
						color = 'GREEN';
						description = `Transaction log set to <#${channel.id}>`;
					});
			}
		} else if (interaction.options.getSubcommand() === 'remove') {
			await guildSettingSchema
				.findOneAndUpdate(
					{
						guildID: interaction.guild.id,
					},
					{
						$unset: {
							transactionLogChannel: '',
						},
					}
				)
				.then(() => {
					color = 'GREEN';
					description = `Removed transaction log.`;
				});
		}

		await interaction.reply({
			embeds: [
				util.embedify(
					color,
					interaction.guild.name,
					interaction.guild.iconURL(),
					description
				),
			],
		});
	},
};
