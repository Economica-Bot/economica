import { CommandInteraction, Guild, GuildMember, PermissionString, TextChannel } from 'discord.js';
import {
	EconomicaSlashCommandBuilder,
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandGroupBuilder,
	PermissionRole,
} from '../structures';

export async function commandCheck(
	interaction: CommandInteraction,
	data: EconomicaSlashCommandBuilder
): Promise<boolean> {
	if (data.devOnly && !process.env.OWNERID.includes(interaction.user.id)) {
		interaction.reply({ content: 'This command is dev only.', ephemeral: true });
		return false;
	}

	if (!data.global && !interaction.guild) {
		interaction.reply({ content: 'This command is server only.', ephemeral: true });
		return false;
	}

	if (interaction.member && !(await permissionCheck(interaction, data))) {
		interaction.reply({ content: 'Insufficient permissions.', ephemeral: true });
		return false;
	}

	return true;
}

const permissionCheck = async (
	interaction: CommandInteraction,
	data: EconomicaSlashCommandBuilder
): Promise<boolean> => {
	const member = interaction.member as GuildMember;
	const guild = interaction.guild as Guild;
	const clientMember = (await guild.members.fetch(interaction.client.user.id)) as GuildMember;
	const channel = interaction.channel as TextChannel;
	const group = data.getSubcommandGroup(
		interaction.options.getSubcommandGroup(false)
	) as EconomicaSlashCommandSubcommandGroupBuilder;
	const subcommand = data.getSubcommand(
		interaction.options.getSubcommand(false)
	) as EconomicaSlashCommandSubcommandBuilder;
	const userPermissions: PermissionString[] = [];
	const clientPermissions: PermissionString[] = [];
	const roles: PermissionRole[] = [];
	const missingUserPermissions: PermissionString[] = [];
	const missingClientPermissions: PermissionString[] = [];
	const missingRoles: PermissionRole[] = [];

	if (
		process.env.OWNERID.includes(member.id) ||
		interaction.guild.ownerId === member.id ||
		member.permissions.has('MANAGE_GUILD')
	) {
		return true;
	}

	if (data.userPermissions) userPermissions.push(...data.userPermissions);
	if (data.clientPermissions) clientPermissions.push(...data.clientPermissions);
	if (data.roles) roles.push(...data.roles);
	if (group?.userPermissions) userPermissions.push(...group.userPermissions);
	if (group?.clientPermissions) clientPermissions.push(...group.clientPermissions);
	if (group?.roles) roles.push(...group.roles);
	if (subcommand?.userPermissions) userPermissions.push(...subcommand.userPermissions);
	if (subcommand?.clientPermissions) clientPermissions.push(...subcommand.clientPermissions);
	if (subcommand?.roles) roles.push(...subcommand.roles);

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

	if (missingClientPermissions.length || missingUserPermissions.length || missingRoles.length)
		return false;
	return true;
};
