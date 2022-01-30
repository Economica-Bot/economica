import { Guild, GuildMember, PermissionString, TextChannel } from 'discord.js';

import { DEVELOPER_IDS, icons } from '../config';
import { GuildModel } from '../models';
import {
	Context,
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandGroupBuilder,
} from '../structures';
import { Authority } from '../typings';

export async function commandCheck(ctx: Context): Promise<boolean> {
	if (!ctx.data.enabled) {
		await ctx.embedify('error', 'user', 'This command is disabled.');
		return false;
	} else if (ctx.data.authority === 'DEVELOPER' && !DEVELOPER_IDS.includes(ctx.interaction.user.id)) {
		await ctx.embedify('error', 'user', 'This command is dev only.');
		return false;
	} else if (!ctx.data.global && !ctx.interaction.guild) {
		await ctx.embedify('error', 'user', 'This command may only be used within servers.');
		return false;
	}

	const hasPermission = await permissionCheck(ctx);
	if (ctx.interaction.member && !hasPermission) {
		return false;
	} else {
		return true;
	}
}

const permissionCheck = async (ctx: Context): Promise<boolean> => {
	const member = ctx.interaction.member as GuildMember;
	const guild = ctx.interaction.guild as Guild;
	const clientMember = (await guild.members.fetch(ctx.interaction.client.user.id)) as GuildMember;
	const channel = ctx.interaction.channel as TextChannel;
	const group = ctx.data.getSubcommandGroup(
		ctx.interaction.options.getSubcommandGroup(false)
	) as EconomicaSlashCommandSubcommandGroupBuilder;
	const subcommand = ctx.data.getSubcommand(
		ctx.interaction.options.getSubcommand(false)
	) as EconomicaSlashCommandSubcommandBuilder;
	const clientPermissions: PermissionString[] = [];
	const missingClientPermissions: PermissionString[] = [];
	let missingAuthority: Authority;

	const authority = subcommand.authority ?? group.authority ?? ctx.data.authority;
	if (ctx.data.clientPermissions) clientPermissions.push(...ctx.data.clientPermissions);
	if (group?.clientPermissions) clientPermissions.push(...group.clientPermissions);
	if (subcommand?.clientPermissions) clientPermissions.push(...subcommand.clientPermissions);

	for (const permission of clientPermissions) {
		if (!clientMember.permissionsIn(channel).has(permission)) missingClientPermissions.push(permission);
	}

	if (missingClientPermissions.length) {
		await ctx.embedify('warn', 'bot', `Missing Bot Permissions: \`${missingClientPermissions}\``);
		return false;
	}

	if (
		DEVELOPER_IDS.includes(member.id) ||
		ctx.interaction.guild.ownerId === member.id ||
		member.permissions.has('ADMINISTRATOR')
	) {
		return true;
	}

	if (authority) {
		const { auth } = await GuildModel.findOne({ guildId: ctx.interaction.guildId });
		const roleAuth = auth.filter((r) => r.authority === authority && member.roles.cache.has(r.roleId));
		if (!roleAuth.length) missingAuthority = authority;
	}

	if (missingAuthority) {
		const description = `Missing authority: \`${missingAuthority}\``;
		await ctx.embedify('error', { name: 'Insufficient Permissions', iconURL: icons.warning }, description);
		return false;
	}

	return true;
};
