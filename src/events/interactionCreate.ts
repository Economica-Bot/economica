import {
	CommandInteraction,
	Guild,
	GuildMember,
	PermissionResolvable,
	PermissionString,
	TextChannel,
} from 'discord.js';
import {
	EconomicaClient,
	EconomicaCommand,
	PermissionRole,
	EconomicaSlashCommandBuilder,
} from '../structures/index';
export const name = 'interactionCreate';

export async function execute(client: EconomicaClient, interaction: CommandInteraction) {
	if (!interaction.isCommand()) {
		return;
	}

	const command = client.commands.get(interaction.commandName) as EconomicaCommand;
	const data = command.data as EconomicaSlashCommandBuilder;
	permissionCheck(interaction, data);

	await command?.execute(client, interaction);
}

async function permissionCheck(
	interaction: CommandInteraction,
	data: EconomicaSlashCommandBuilder
) {
	const member = interaction.member as GuildMember;
	const guild = interaction.guild as Guild;
	const clientMember = (await guild.members.fetch(interaction.client.user.id)) as GuildMember;
	const channel = interaction.channel as TextChannel;
	const group = data.getSubcommandGroup(interaction);
	const subcommand = data.getSubcommand(interaction);
	const userPermissions: PermissionString[] = [];
	const clientPermissions: PermissionString[] = [];
	const roles: PermissionRole[] = [];
	const missingUserPermissions: PermissionString[] = [];
	const missingClientPermissions: PermissionString[] = [];
	const missingRoles: PermissionRole[] = [];

	if (data.userPermissions) userPermissions.push(...data.userPermissions);
	if (data.clientPermissions) clientPermissions.push(...data.clientPermissions);
	if (data.roles) roles.push(...data.roles);
	if (group.userPermissions) userPermissions.push(...group.userPermissions);
	if (group.clientPermissions) clientPermissions.push(...group.clientPermissions);
	if (group.roles) roles.push(...group.roles);
	if (subcommand.userPermissions) userPermissions.push(...subcommand.userPermissions);
	if (subcommand.clientPermissions) clientPermissions.push(...subcommand.clientPermissions);
	if (subcommand.roles) roles.push(...subcommand.roles);

	for (const permission of userPermissions)
		if (!member.permissionsIn(channel).has(permission)) missingUserPermissions.push(permission);
	for (const permission of userPermissions)
		if (!clientMember.permissionsIn(channel).has(permission))
			missingClientPermissions.push(permission);
	for (const role of roles) {
		const guildRole = (await guild.roles.fetch()).find(
			(r) => r.name.toLowerCase() === role.name.toLowerCase()
		);
		if (!guildRole)
			missingRoles.push(
				new PermissionRole(`Please create an \`${role.name}\` role. Case insensitive.`, true)
			);
		else if (role.required && !member.roles.cache.has(guildRole.id)) missingRoles.push(role);
	}
}
