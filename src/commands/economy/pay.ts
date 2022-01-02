import { CommandInteraction } from 'discord.js';
import {
	EconomicaClient,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	TransactionTypes,
} from '../../structures';
import { getCurrencySymbol, getEconInfo, transaction } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('pay')
		.setDescription('Pay funds to another user.')
		.setGroup('economy')
		.setFormat('<user> <amount | all>')
		.setExamples(['pay @Wumpus all', 'pay @JohnDoe 100'])
		.setGlobal(false)
		.addUserOption((option) =>
			option.setName('user').setDescription('Specify a user').setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('amount').setDescription('Specify an amount').setRequired(true)
		);

	execute = async (client: EconomicaClient, interaction: CommandInteraction) => {
		const cSymbol = await getCurrencySymbol(interaction.guildId);
		const user = interaction.options.getUser('user');
		const { wallet } = await getEconInfo(interaction.guildId, user.id);
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
			TransactionTypes.Pay,
			`Payment to  <@!${user.id}>`,
			-result,
			0,
			-result
		);

		await transaction(
			client,
			interaction.guild.id,
			user.id,
			TransactionTypes.Pay,
			`Payment from  <@!${interaction.id}>`,
			result,
			0,
			result
		);

		return await interaction.reply(`Payed <@!${user.id}> ${cSymbol}${amount.toLocaleString()}`);
	};
}
