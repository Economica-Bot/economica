import { CommandInteraction } from 'discord.js';
import {
	EconomicaClient,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
} from '../../structures/index';
import { embedify } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('permission')
		.setDescription('See the permissions of a command.')
		.setGroup('utility')
		.setFormat('<command>')
		.addStringOption((option) =>
			option.setName('command').setDescription('Specify a command.').setRequired(true)
		);

	execute = async (client: EconomicaClient, interaction: CommandInteraction) => {
		const commandInput = interaction.options.getString('command');
		const command = client.commands.get(commandInput);
		if (!command) {
			return await interaction.reply('Could not find that command.');
		}

		const data = command.data as EconomicaSlashCommandBuilder;

		let description = `**${
			data.name
		} Command Permissions**\n__User Permissions__:\n\`${
			data.userPermissions ?? '`None`'
		}\`\n__Client Permissions:__\n\`${
			data.clientPermissions ?? '`None`'
		}\`\n__Roles:__\n\`${
			data.roles ?? '`None`'
		}\`\n\n`;

		const subcommandGroup = interaction.options.getSubcommandGroup(false);
		const subcommand = interaction.options.getSubcommand(false);

		if (subcommandGroup) {
			const subcommandGroupData = data.getSubcommandGroup(subcommandGroup);
			description += `**${
				subcommandGroupData.name
			}Subcommand Group Permissions**\n__User Permissions:__\n\`${
				subcommandGroupData.userPermissions ?? '`None`'
			}\`\n__Client Permissions:__\n\`${
				subcommandGroupData.clientPermissions ?? '`None`'
			}\`\n__Roles:__\n\`${
				subcommandGroupData.roles ?? '`None`'
			}\`\n\n`;
		}

		if (subcommand) {
			const subcommandData = data.getSubcommand(subcommand);
			description += `**${
				subcommandData.name
			} Subcommand Permissions**\n__User Permissions:__\n\`${
				subcommandData.userPermissions ?? '`None`'
			}\`\n__Client Permissions:__\n\`${
				subcommandData.clientPermissions ?? '`None`'
			}\`\n__Roles:__\n\`${
				subcommandData.roles ?? '`None`'
			}\`\n\n`;
		}

		const name = `${subcommandGroup}:${subcommand == undefined ? subcommand : ''}`;

		await interaction.reply({
			embeds: [
				embedify(
					'BLUE',
					`Permission Hierarchy for ${command.data.name} ${name}`,
					null,
					description
				),
			],
		});
	};
}
