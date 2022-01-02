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
		.setName('deposit')
		.setDescription('Deposit funds from your wallet to your treasury.')
		.setGroup('economy')
		.setFormat('<amount | all>')
		.setExamples(['deposit all', 'deposit 100'])
		.setGlobal(false)
		.addStringOption((option) =>
			option.setName('amount').setDescription('Specify an amount').setRequired(true)
		);

	execute = async (client: EconomicaClient, interaction: CommandInteraction) => {
		const cSymbol = await getCurrencySymbol(interaction.guildId);
		const { wallet } = await getEconInfo(interaction.guildId, interaction.user.id);
		const amount = interaction.options.getString('amount');
		const result = amount === 'all' ? wallet : parseInt(amount);

		if (result) {
			if (result < 1) {
				return await interaction.reply(`Invalid amount: ${result}\nAmount less than 0`);
			}

			if (result > wallet) {
				return await interaction.reply(
					`Invalid amount: ${amount}\nExceeds current wallet:${cSymbol}${wallet}`
				);
			}
		} else {
			return await interaction.reply(`Invalid amount: \`${result}\``);
		}

		await transaction(
			client,
			interaction.guildId,
			interaction.user.id,
			TransactionTypes.Deposit,
			'`system`',
			-result,
			result,
			0
		);

		const embed = new MessageEmbed()
			.setColor('GREEN')
			.setAuthor({ name: interaction.user.username, url: interaction.user.displayAvatarURL() })
			.setDescription(`Deposited ${cSymbol}${result.toLocaleString()}`);

		return await interaction.reply({ embeds: [embed] });
	};
}
