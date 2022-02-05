import { Guild, GuildMember, PermissionString, TextChannel } from 'discord.js';
import ms from 'ms';

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
		await ctx.embedify('error', 'user', 'This command is disabled.', true);
		return false;
	} else if (ctx.data.authority === 'DEVELOPER' && !DEVELOPER_IDS.includes(ctx.interaction.user.id)) {
		await ctx.embedify('error', 'user', 'This command is dev only.', true);
		return false;
	} else if (!ctx.data.global && !ctx.interaction.guild) {
		await ctx.embedify('error', 'user', 'This command may only be used within servers.', true);
		return false;
	}

	const cooldown = await cooldownCheck(ctx);
	if (!cooldown) {
		return false;
	}

	const hasPermission = await permissionCheck(ctx);
	if (ctx.interaction.member && !hasPermission) {
		return false;
	} else {
		return true;
	}
}

async function permissionCheck(ctx: Context): Promise<boolean> {
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
		await ctx.embedify('warn', 'bot', `Missing Bot Permissions: \`${missingClientPermissions}\``, true);
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
		await ctx.embedify('error', { name: 'Insufficient Permissions', iconURL: icons.warning }, description, true);
		return false;
	}

	return true;
}

async function cooldownCheck(ctx: Context): Promise<boolean> {
	const key = `${ctx.interaction.user.id}-${ctx.interaction.commandName}`;
	const inter = ctx.client.cooldowns.get(key);
	if (!inter) {
		ctx.client.cooldowns.set(key, ctx.interaction);
		return true;
	}

	const income = ctx.guildDocument.income;
	if (!(ctx.interaction.commandName in income)) {
		return true;
	}

	let cooldown;
	for (const obj of Object.entries(income)) {
		if (obj[0] === ctx.interaction.commandName) {
			cooldown = obj[1].cooldown;
		}
	}

	if (inter.createdTimestamp + cooldown > Date.now()) {
		const embed = ctx
			.embedify('warn', 'user', `Please run this command in \`${ms(inter.createdTimestamp + cooldown - Date.now())}\``)
			.setFooter({ text: `Cooldown: ${ms(cooldown)}` });
		ctx.interaction.reply({ embeds: [embed], ephemeral: true });
		return false;
	} else {
		ctx.client.cooldowns.set(key, ctx.interaction);
		return true;
	}
}
