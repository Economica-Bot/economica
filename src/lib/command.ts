import { CommandInteraction, Guild, GuildMember, MessageEmbed, PermissionString, TextChannel } from 'discord.js';

import { authors, hyperlinks } from '.';
import { DEVELOPER_IDS } from '../config';
import { GuildModel } from '../models';
import {
	Authority,
	EconomicaSlashCommandBuilder,
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandGroupBuilder,
} from '../structures';

export async function commandCheck(
	interaction: CommandInteraction,
	data: EconomicaSlashCommandBuilder
): Promise<boolean> {
	if (data.authority === 'DEVELOPER' && !DEVELOPER_IDS.includes(interaction.user.id)) {
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
	const missingClientPermissions: PermissionString[] = [];
	let missingAuthority: Authority;

	if (
		DEVELOPER_IDS.includes(member.id) ||
		interaction.guild.ownerId === member.id ||
		member.permissions.has('MANAGE_GUILD')
	) {
		return { status: true };
	}

	const authority = subcommand.authority ?? group.authority ?? data.authority;
	if (data.clientPermissions) clientPermissions.push(...data.clientPermissions);
	if (group?.clientPermissions) clientPermissions.push(...group.clientPermissions);
	if (subcommand?.clientPermissions) clientPermissions.push(...subcommand.clientPermissions);

	for (const permission of clientPermissions)
		if (!clientMember.permissionsIn(channel).has(permission)) missingClientPermissions.push(permission);

	if (authority) {
		const { auth } = await GuildModel.findOne({ guildId: interaction.guildId });
		const roleAuth = auth.filter((r) => r.authority === authority && member.roles.cache.has(r.roleId));
		if (!roleAuth.length) missingAuthority = authority;
		if (DEVELOPER_IDS.includes(member.id)) missingAuthority = null;
	}

	if (missingClientPermissions.length || missingAuthority) {
		const embed = new MessageEmbed()
			.setTitle('Insufficient Permissions')
			.setColor('RED')
			.setAuthor(authors.error)
			.setDescription(hyperlinks.insertAll());

		if (missingClientPermissions.length)
			embed.addField('Missing Bot Permissions', `\`${missingClientPermissions.join('`, `')}\``);
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
