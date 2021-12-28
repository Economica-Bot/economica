import { CommandInteraction } from 'discord.js';
import { PermissionRole } from '../../structures/CommandOptions';
import EconomicaClient from '../../structures/EconomicaClient';
import EconomicaCommand from '../../structures/EconomicaCommand';
import { EconomicaSlashCommandBuilder } from '../../structures/EconomicaSlashCommandBuilder';
import { embedify } from '../../util';

export default class extends EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('permission')
		.setDescription('Permission test command.')
		.setClientPermissions(['ADD_REACTIONS', 'SEND_MESSAGES'])
		.setUserPermissions(['ADMINISTRATOR', 'VIEW_AUDIT_LOG'])
		.setRoles([new PermissionRole('EXAMPLE_ROLE', true)])
		.addEconomicaSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('subcommandgroup')
				.setDescription('Example subcommand group.')
				.setClientPermissions(['CHANGE_NICKNAME'])
				.setUserPermissions(['CREATE_INSTANT_INVITE', 'ATTACH_FILES', 'CONNECT'])
				.addEconomicaSubcommand((subcommand) => subcommand.setName('subcommand1').setDescription('Example subcommand without overrides.'))
				.addEconomicaSubcommand((subcommand) =>
					subcommand
						.setName('subcommand2')
						.setDescription('Example subcommand with overrides.')
						.setClientPermissions(['DEAFEN_MEMBERS'])
						.setUserPermissions(['KICK_MEMBERS'])
						.setRoles([new PermissionRole('SUBCOMMAND_ONLY_ROLE', true)])
				)
		)
		.addEconomicaSubcommand((subcommand) => subcommand.setName('subcommand3').setDescription('Top level subcommand'));

	execute = async (client: EconomicaClient, interaction: CommandInteraction) => {
		const data = this.data as EconomicaSlashCommandBuilder;
		interaction.reply({
			embeds: [
				embedify(
					'BLUE',
					'Permission Hierarchy for Permissions Command',
					null,
					`**${
						data.name
					} Command Permissions**\n__User Permissions__:\n\`${data.getUserPermissions()}\`\n__Client Permissions:__\n\`${data.getClientPermissions()}\`\n__Roles:__\n\`${data.getRoles()}\`\n\n**${
						data.getSubcommandGroup(interaction).name
					} Subcommand Group Permissions**\n__User Permissions:__\n\`${data.getSubcommandGroup(interaction).userPermissions}\`\n__Client Permissions:__\n\`${
						data.getSubcommandGroup(interaction).clientPermissions
					}\`\n__Roles:__\n\`${data.getSubcommandGroup(interaction).roles}\`\n\n**${data.getSubcommand(interaction).name} Subcommand Permissions**\n__User Permissions:__\n\`${
						data.getSubcommand(interaction).userPermissions
					}\`\n__Client Permissions:__\n\`${data.getSubcommand(interaction).clientPermissions}\`\n__Roles:__\n\`${data.getSubcommand(interaction).roles}\``
				),
			],
		});
	};
}
