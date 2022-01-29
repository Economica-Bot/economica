import { CommandInteraction, Guild, GuildMember, MessageEmbed, PermissionString, TextChannel } from 'discord.js';

import { authors, hyperlinks } from '.';
import { DEVELOPER_IDS } from '../config';
import { GuildModel } from '../models';
import {
	Context,
	EconomicaSlashCommandBuilder,
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandGroupBuilder,
} from '../structures';
import { Authority } from '../typings';

export async function commandCheck(ctx: Context): Promise<boolean> {
	if (!ctx.data.enabled) {
		await ctx.embedify('error', 'user', 'This command is disabled.');
		return false;
	}

	if (ctx.data.authority === 'DEVELOPER' && !DEVELOPER_IDS.includes(ctx.interaction.user.id)) {
		await ctx.embedify('error', 'user', 'This command is dev only.');
		return false;
	}

	if (!ctx.data.global && !ctx.interaction.guild) {
		await ctx.embedify('error', 'user', 'This command may only be used within servers.');
		return false;
	}

	const permissionResponse = await permissionCheck(ctx.interaction, ctx.data);
	if (ctx.interaction.member && !permissionResponse.status) {
		ctx.interaction.reply({
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
	const clientPermissions: PermissionString[] = [];
	const missingClientPermissions: PermissionString[] = [];
	let missingAuthority: Authority;

	if (
		DEVELOPER_IDS.includes(member.id) ||
		interaction.guild.ownerId === member.id ||
		member.permissions.has('ADMINISTRATOR')
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
