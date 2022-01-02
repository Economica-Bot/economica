import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import {
	EconomicaClient,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	PermissionRole,
	TransactionTypes,
} from '../../structures';
import { getCurrencySymbol, transaction } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('add-money')
		.setDescription('Modify a balance.')
		.setGroup('economy')
		.setFormat('<user> <amount> <target>')
		.setExamples(['add-money @JohnDoe 300 wallet', 'add-money @Wumpus 100 treasury'])
		.setRoles([new PermissionRole('ECONOMY MANAGER', true)])
		.setGlobal(false)
		.addUserOption((option) =>
			option.setName('user').setDescription('Specify a user').setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('amount').setDescription('Specify an amount').setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('target')
				.setDescription('Specify where the money is added.')
				.addChoices([
					['wallet', 'wallet'],
					['treasury', 'treasury'],
				])
				.setRequired(true)
		);

	execute = async (client: EconomicaClient, interaction: CommandInteraction) => {
		const member = interaction.options.getMember('user') as GuildMember;
		const amount = parseInt(interaction.options.getString('amount'));
		const target = interaction.options.getString('target');
		const cSymbol = await getCurrencySymbol(interaction.guild.id);
		if (!amount) return await interaction.reply(`Invalid amount: \`${amount}\``);
		await transaction(
			client,
			interaction.guild.id,
			member.id,
			TransactionTypes.Add_Money,
			`add-money | <@!${interaction.member.user.id}>`,
			target === 'wallet' ? amount : 0,
			target === 'treasury' ? amount : 0,
			amount
		);

		const embed = new MessageEmbed()
			.setColor('GREEN')
			.setAuthor({ name: member.user.username, url: member.user.displayAvatarURL() })
			.setDescription(
				`Added ${cSymbol}${amount.toLocaleString()} to <@!${member.user.id}>'s \`${target}\`.`
			);

		return await interaction.reply({ embeds: [embed] });
	};
}
