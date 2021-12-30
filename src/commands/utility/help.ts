import { CommandInteraction, DiscordAPIError, MessageEmbed } from 'discord.js';
import {
	EconomicaClient,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandGroupBuilder,
} from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('help')
		.setDescription(
			'List commands, or detailed information about a command group, command, or subcommand.'
		)
		.setGroup('utility')
		.setFormat('[command]')
		.setExamples(['help', 'help ban'])
		.setGlobal(true)
		.addStringOption((option) =>
			option
				.setName('query')
				.setDescription('Specify a group, command, or subcommand.')
				.setRequired(false)
		);

	execute = async (client: EconomicaClient, interaction: CommandInteraction) => {
		const query = interaction.options.getString('query');
		if (!query) {
			const embed = new MessageEmbed()
				.setAuthor(`${client.user.username} Commands`)
				.setThumbnail(client.user.displayAvatarURL())
				.setColor('YELLOW');

			const commands: EconomicaSlashCommandBuilder[] = [];
			const groups: string[] = [];
			client.commands.forEach((command) => {
				const data = command.data as EconomicaSlashCommandBuilder;
				if (!groups.includes(data.group)) groups.push(data.group);
				commands.push(data);
			});

			console.log(groups)

			for (const group of groups) {
				const list: string[] = [];
				for (const command of commands) {
					if (command.group === group) list.push(command.name);
				}

				console.log(group, list)

				embed.addField(group, `\`${list.join('`. `')}\``);
			}

			return await interaction.reply({ embeds: [embed] });
		}

		const command = client.commands.get(query);
		if (command) {
			const data = command.data as EconomicaSlashCommandBuilder;
			const embed = new MessageEmbed()
				.setAuthor({
					name: command.data.name,
					iconURL: client.user.displayAvatarURL(),
				})
				.setColor('YELLOW')
				.setDescription(
					`>>> *${data.description}* \n${data.format ? `Format: \`${data.format}\`` : ''}`
				);

			return await interaction.reply({ embeds: [embed] });
		}

		if (!command) {
			return await interaction.reply('Could not find that command.');
		}
	};
}
