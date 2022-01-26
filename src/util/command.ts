import {
	CommandInteraction,
	Guild,
	GuildMember,
	MessageEmbed,
	PermissionString,
	TextChannel,
} from 'discord.js';
import {
	Authority,
	EconomicaSlashCommandBuilder,
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandGroupBuilder,
	PermissionRole,
} from '../structures';
import { GuildModel } from '../models';
import { authors, hyperlinks } from './common';

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

	const permissionResponse = await permissionCheck(interaction, data);
	if (interaction.member && !permissionResponse.status) {
		interaction.reply({
			embeds: [permissionResponse.embed],
			ephemeral: true,
		});
		return false;
	}

	return true;
}

const permissionCheck = async (
	interaction: CommandInteraction,
	data: EconomicaSlashCommandBuilder
): Promise<{
	embed?: MessageEmbed;
	status: boolean;
}> => {
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
	let missingAuthority: Authority;

	if (
		process.env.OWNERID.includes(member.id) ||
		interaction.guild.ownerId === member.id ||
		member.permissions.has('ADMINISTRATOR')
	) {
		return {
			status: true,
		};
	}

	const authority = subcommand.authority ?? group.authority ?? data.authority;
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
	for (const permission of clientPermissions)
		if (!clientMember.permissionsIn(channel).has(permission))
			missingClientPermissions.push(permission);
	await guild.roles.fetch();
	for (const role of roles) {
		const guildRole = guild.roles.cache.find(
			(r) => r.name.toLowerCase() === role.name.toLowerCase()
		);
		if (!guildRole) {
			missingRoles.push(
				new PermissionRole(`Please create an \`${role.name}\` role. Case insensitive.`, true)
			);
		} else if (role.required && !member.roles.cache.has(guildRole.id)) missingRoles.push(role);
	}

	if (authority) {
		const { auth } = await GuildModel.findOne({
			guildId: interaction.guildId,
		});

		const roleAuth = auth.filter(
			(r) => r.authority === authority && member.roles.cache.has(r.roleId)
		);
		if (!roleAuth.length) {
			missingAuthority = authority;
		}
	}

	if (
		missingClientPermissions.length ||
		missingUserPermissions.length ||
		missingRoles.length ||
		missingAuthority
	) {
		const embed = new MessageEmbed()
			.setTitle('Insufficient Permissions')
			.setColor('RED')
			.setAuthor(authors.error)
			.setDescription(hyperlinks.insertAll());

		if (missingClientPermissions.length)
			embed.addField('Missing Bot Permissions', `\`${missingClientPermissions.join('`, `')}\``);
		if (missingUserPermissions.length)
			embed.addField('Missing User Permissions', `\`${missingUserPermissions.join('`, `')}\``);
		if (missingRoles.length)
			embed.addField('Missing User Roles', `\`${missingRoles.join('`, `')}\``);
		if (missingAuthority.length) {
			embed.addField(
				'Missing User Economy Authority',
				`\`Economy ${missingAuthority[0].toUpperCase() + missingAuthority.substring(1)}\``
			);
		}

		return {
			embed,
			status: false,
		};
	}
	return {
		status: true,
	};
};
