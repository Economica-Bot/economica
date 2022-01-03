import {parse_string} from '@adrastopoulos/number-parser';
import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import {
	EconomicaClient,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	PermissionRole,
	TransactionTypes,
} from '../../structures';
import { getCurrencySymbol, getEconInfo, transaction } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('set-money')
		.setDescription('Set a balance.')
		.setGroup('economy')
		.setFormat('<user> <amount> <target>')
		.setExamples(['set-money @JohnDoe 300 wallet', 'set-money @Wumpus 100 treasury'])
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
		const cSymbol = await getCurrencySymbol(interaction.guild.id);
		const member = interaction.options.getMember('user') as GuildMember;
		const amount = parse_string(interaction.options.getString('amount'));
		const target = interaction.options.getString('target');
		const { wallet, treasury } = await getEconInfo(interaction.guildId, interaction.user.id);
		const difference = target === 'wallet' ? amount - wallet : amount - treasury;
		console.log(difference)
		if (!amount) return await interaction.reply(`Invalid amount: \`${amount}\``);
		await transaction(
			client,
			interaction.guild.id,
			member.id,
			TransactionTypes.Set_Money,
			`set-money | <@!${interaction.member.user.id}>`,
			target === 'wallet' ? difference : 0,
			target === 'treasury' ? difference : 0,
			difference
		);

		const embed = new MessageEmbed()
			.setColor('GREEN')
			.setAuthor({ name: member.user.username, url: member.user.displayAvatarURL() })
			.setDescription(
				`Set <@!${member.user.id}>'s \`${target}\` to ${cSymbol}${amount.toLocaleString()}.`
			);

		return await interaction.reply({ embeds: [embed] });
	};
}
