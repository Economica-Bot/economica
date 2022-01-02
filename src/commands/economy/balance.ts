import { CommandInteraction, MessageEmbed } from 'discord.js';
import { EconomicaClient, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import { getCurrencySymbol, getEconInfo } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('balance')
		.setDescription('View a balance.')
		.setGroup('economy')
		.setFormat('[user]')
		.setExamples(['balance', 'balance @JohnDoe'])
		.setGlobal(false)
		.addUserOption((option) =>
			option.setName('user').setDescription('Specify a user.').setRequired(false)
		);

	execute = async (client: EconomicaClient, interaction: CommandInteraction) => {
		const user = interaction.options.getUser('user') ?? interaction.user;
		const cSymbol = await getCurrencySymbol(interaction.guild.id);
		const { wallet, treasury, total, rank } = await getEconInfo(interaction.guildId, user.id);
		const embed = new MessageEmbed()
			.setColor('GOLD')
			.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
			.setFooter({ text: `🏆 Rank ${rank}` })
			.addFields(
				{ name: 'Wallet', value: `${cSymbol}${wallet.toLocaleString()}`, inline: true },
				{ name: 'Treasury', value: `${cSymbol}${treasury.toLocaleString()}`, inline: true },
				{ name: 'Total', value: `${cSymbol}${total.toLocaleString()}`, inline: true }
			);
		return await interaction.reply({ embeds: [embed] });
	};
}
