import { Guild, GuildMember, PermissionString, TextChannel } from 'discord.js';
import ms from 'ms';

import { DEVELOPER_IDS, DEV_COOLDOWN_EXEMPT, DEV_MODULE_EXEMPT, DEV_PERMISSION_EXEMPT } from '../config';
import {
	Context,
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandGroupBuilder,
} from '../structures';
import { Authorities, icons } from '../typings';

async function checkCooldown(ctx: Context): Promise<boolean> {
	const { incomes, intervals } = ctx.guildEntity;
	const key = `${ctx.interaction.guildId}-${ctx.interaction.user.id}-${ctx.interaction.commandName}`;
	if (ctx.interaction.commandName in { ...incomes, ...intervals }) {
		const date = ctx.client.cooldowns.get(key);
		let cooldown: number;

		if (!date) {
			ctx.client.cooldowns.set(key, new Date());
			return true;
		}

		if (ctx.interaction.commandName in incomes) {
			Object.keys(incomes).forEach((k: keyof typeof incomes) => {
				if (k === ctx.interaction.commandName) {
					cooldown = incomes[k].cooldown;
				}
			});
		} else if (ctx.interaction.commandName in intervals) {
			Object.keys(intervals).forEach((k: keyof typeof intervals) => {
				if (k === ctx.interaction.commandName) {
					cooldown = intervals[k].cooldown;
				}
			});
		}

		if (date.getTime() + cooldown > Date.now()) {
			const embed = ctx
				.embedify('warn', 'user', `You may run this command in \`${ms(date.getTime() + cooldown - Date.now())}\``)
				.setFooter({ text: `Cooldown: ${ms(cooldown)}` });
			ctx.interaction.reply({ embeds: [embed], ephemeral: true });
			return false;
		}
		ctx.client.cooldowns.set(key, new Date());
		return true;
	}
	return true;
}

async function checkPermission(ctx: Context): Promise<boolean> {
	const member = ctx.interaction.member as GuildMember;
	const guild = ctx.interaction.guild as Guild;
	const clientMember = (await guild.members.fetch(ctx.interaction.client.user.id)) as GuildMember;
	const channel = ctx.interaction.channel as TextChannel;
	const group = ctx.data.getSubcommandGroup(
		ctx.interaction.options.getSubcommandGroup(false),
	) as EconomicaSlashCommandSubcommandGroupBuilder;
	const subcommand = ctx.data.getSubcommand(
		ctx.interaction.options.getSubcommand(false),
	) as EconomicaSlashCommandSubcommandBuilder;
	const clientPermissions: PermissionString[] = [];
	const missingClientPermissions: PermissionString[] = [];
	let missingAuthority: keyof typeof Authorities;

	const authority = subcommand.authority ?? group.authority ?? ctx.data.authority;
	if (ctx.data.clientPermissions) clientPermissions.push(...ctx.data.clientPermissions);
	if (group?.clientPermissions) clientPermissions.push(...group.clientPermissions);
	if (subcommand?.clientPermissions) clientPermissions.push(...subcommand.clientPermissions);

	clientPermissions.forEach((permission) => {
		if (!clientMember.permissionsIn(channel).has(permission)) missingClientPermissions.push(permission);
	});

	if (missingClientPermissions.length) {
		await ctx.embedify('warn', 'bot', `Missing Bot Permissions: \`${missingClientPermissions}\``, true);
		return false;
	} if (ctx.interaction.guild.ownerId === member.id || member.permissions.has('ADMINISTRATOR')) {
		return true;
	} if (authority) {
		const auth = await ctx.guildEntity.auth;
		const roleAuth = auth.filter((r) => r.authority === authority && (member.roles.cache.has(r.id) || member.id === r.id));
		if (!roleAuth.length) missingAuthority = authority;
	} if (missingAuthority) {
		const description = `Missing authority: \`${missingAuthority}\``;
		await ctx.embedify('error', { name: 'Insufficient Permissions', iconURL: icons.WARNING }, description, true);
		return false;
	}

	return true;
}

async function validateModule(ctx: Context): Promise<boolean> {
	const modules = await ctx.guildEntity.modules;
	if (!modules.find((module) => module.module === ctx.data.module)) {
		await ctx.embedify('warn', 'user', `The \`${ctx.data.module}\` module is not enabled in this server.`, true);
		return false;
	}
	return true;
}

export async function commandCheck(ctx: Context): Promise<boolean> {
	const isDeveloper = DEVELOPER_IDS.includes(ctx.interaction.user.id);
	if (!ctx.data.enabled) {
		await ctx.embedify('warn', 'user', 'This command is disabled.', true);
		return false;
	} if (ctx.data.authority === 'DEVELOPER' && !isDeveloper) {
		await ctx.embedify('warn', 'user', 'This command is dev only.', true);
		return false;
	} if (!ctx.data.global && !ctx.interaction.guild) {
		await ctx.embedify('warn', 'user', 'This command may only be used within servers.', true);
		return false;
	} if (!isDeveloper || !DEV_COOLDOWN_EXEMPT) {
		const valid = await checkCooldown(ctx);
		if (!valid) return false;
	} else if (!isDeveloper || !DEV_PERMISSION_EXEMPT) {
		const valid = await checkPermission(ctx);
		if (!valid) return false;
	} else if (!isDeveloper || !DEV_MODULE_EXEMPT) {
		const valid = await validateModule(ctx);
		if (!valid) return false;
	}

	return true;
}
