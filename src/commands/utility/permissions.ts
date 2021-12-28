import { CommandInteraction } from 'discord.js';
import EconomicaClient from '../../structures/EconomicaClient';
import EconomicaCommand from '../../structures/EconomicaCommand';
import { EconomicaSlashCommandBuilder } from '../../structures/EconomicaSlashCommandBuilder';
import { embedify } from '../../util';

export default class PermissionsCommand extends EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('permission')
		.setDescription('See the permissions of a command.')
		.setFormat('<command>')
		.addStringOption((option) =>
			option
				.setName('command')
				.setDescription('Specify a command.')
				.setRequired(true)
		);

	execute = async (
		client: EconomicaClient,
		interaction: CommandInteraction
	) => {
		const commandInput = interaction.options.getString('command');
		const command = client.commands.get(commandInput);
		if (!command) {
			return interaction.reply('Could not find that command.');
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

		if (data.getSubcommandGroup(interaction)) {
			description += `**${
				data.getSubcommandGroup(interaction).name
			}Subcommand Group Permissions**\n__User Permissions:__\n\`${
				data.getSubcommandGroup(interaction).userPermissions ?? '`None`'
			}\`\n__Client Permissions:__\n\`${
				data.getSubcommandGroup(interaction).clientPermissions ?? '`None`' 
			}\`\n__Roles:__\n\`${
				data.getSubcommandGroup(interaction).roles ?? '`None`'
			}\`\n\n`;
		}

		if (data.getSubcommand(interaction)) {
			`**${
				data.getSubcommand(interaction).name
			} Subcommand Permissions**\n__User Permissions:__\n\`${
				data.getSubcommand(interaction).userPermissions ?? '`None`'
			}\`\n__Client Permissions:__\n\`${
				data.getSubcommand(interaction).clientPermissions ?? '`None`'
			}\`\n__Roles:__\n\`${
				data.getSubcommand(interaction).roles ?? '`None`'
			}\``;
		}

		const name =
			data.getSubcommandGroup(interaction) 
			+ ' ' 
			+ data.getSubcommand(interaction) == undefined ? data.getSubcommand(interaction) : '';

		interaction.reply({
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
