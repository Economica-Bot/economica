import { parse_string } from '@adrastopoulos/number-parser';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import {
	EconomicaClient,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	TransactionTypes,
} from '../../structures';
import { getCurrencySymbol, getEconInfo, transaction } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('withdraw')
		.setDescription('Withdraw funds from your treasury to your wallet.')
		.setGroup('economy')
		.setFormat('<amount | all>')
		.setExamples(['withdraw all', 'withdraw 100'])
		.setGlobal(false)
		.addStringOption((option) =>
			option.setName('amount').setDescription('Specify an amount').setRequired(true)
		);

	execute = async (client: EconomicaClient, interaction: CommandInteraction) => {
		const cSymbol = await getCurrencySymbol(interaction.guildId);
		const { treasury } = await getEconInfo(interaction.guildId, interaction.user.id);
		const amount = interaction.options.getString('amount');
		const result = amount === 'all' ? treasury : parse_string(amount);

		if (result) {
			if (result < 1) {
				return await interaction.reply(`Invalid amount: ${result}\nAmount less than 0`);
			}

			if (result > treasury) {
				return await interaction.reply(
					`Invalid amount: ${amount}\nExceeds current treasury:${cSymbol}${treasury}`
				);
			}
		} else {
			return await interaction.reply(`Invalid amount: \`${result}\``);
		}

		await transaction(
			client,
			interaction.guildId,
			interaction.user.id,
			TransactionTypes.Withdraw,
			'`system`',
			-result,
			result,
			0
		);

		const embed = new MessageEmbed()
			.setColor('GREEN')
			.setAuthor({ name: interaction.user.username, url: interaction.user.displayAvatarURL() })
			.setDescription(`Withdrew ${cSymbol}${result.toLocaleString()}`);

		return await interaction.reply({ embeds: [embed] });
	};
}
