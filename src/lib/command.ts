import { GuildMember, PermissionString, TextChannel } from 'discord.js';
import ms from 'ms';

import { DEV_COOLDOWN_EXEMPT, DEV_MODULE_EXEMPT, DEV_PERMISSION_EXEMPT, DEVELOPER_IDS } from '../config.js';
import { Context } from '../structures/index.js';
import { Authorities } from '../typings/index.js';

async function checkPermission(ctx: Context): Promise<boolean> {
	const member = ctx.interaction.member as GuildMember;
	const channel = ctx.interaction.channel as TextChannel;
	const group = ctx.data.getSubcommandGroup(ctx.interaction.options.getSubcommandGroup(false))[0];
	const subcommand = ctx.data.getSubcommand(ctx.interaction.options.getSubcommand(false))[0];
	const clientPermissions: PermissionString[] = [];
	const missingClientPermissions: PermissionString[] = [];
	if (ctx.data.clientPermissions) clientPermissions.push(...ctx.data.clientPermissions);
	if (group?.clientPermissions) clientPermissions.push(...group.clientPermissions);
	if (subcommand?.clientPermissions) clientPermissions.push(...subcommand.clientPermissions);
	clientPermissions.forEach((permission) => {
		if (!ctx.interaction.guild.me.permissionsIn(channel).has(permission)) missingClientPermissions.push(permission);
	});
	if (missingClientPermissions.length) {
		await ctx.embedify('warn', 'bot', `Missing Bot Permissions: \`${missingClientPermissions}\``).send(true);
		return false;
	}
	if (ctx.interaction.guild.ownerId === member.id || member.permissions.has('ADMINISTRATOR')) {
		return true;
	}
	return true;
}

async function checkCooldown(ctx: Context): Promise<boolean> {
	const { incomes, intervals } = ctx.guildEntity;
	const key = `${ctx.interaction.guildId}-${ctx.interaction.user.id}-${ctx.interaction.commandName}`;
	if (!(ctx.interaction.commandName in { ...incomes, ...intervals })) return true;
	const date = ctx.client.cooldowns.get(key);
	let cooldown: number;
	if (!date) {
		ctx.client.cooldowns.set(key, new Date());
		return true;
	}
	if (ctx.interaction.commandName in { ...intervals, ...incomes }) {
		Object.keys({ ...intervals, ...incomes }).forEach((k) => {
			if (k === ctx.interaction.commandName) cooldown = { ...intervals, ...incomes }[k].cooldown;
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

async function checkAuthority(ctx: Context): Promise<boolean> {
	const member = ctx.interaction.member as GuildMember;
	const group = ctx.data.getSubcommandGroup(ctx.interaction.options.getSubcommandGroup(false))[0];
	const subcommand = ctx.data.getSubcommand(ctx.interaction.options.getSubcommand(false))[0];
	let missingAuthority: keyof typeof Authorities;
	const authority = subcommand.authority ?? group.authority ?? ctx.data.authority;
	if (authority) {
		const auth = await ctx.guildEntity.auth;
		const roleAuth = auth.filter((r) => r.authority === authority && (member.roles.cache.has(r.id) || member.id === r.id));
		if (!roleAuth.length) missingAuthority = authority;
	}
	if (missingAuthority) {
		const description = `Missing authority: \`${missingAuthority}\``;
		await ctx.embedify('error', 'user', `Insufficient Permissions: \`${description}\``).send(true);
		return false;
	}
	return true;
}

async function validateModule(ctx: Context): Promise<boolean> {
	if (ctx.guildEntity.modules.find((module) => module === ctx.data.module)) {
		await ctx.embedify('warn', 'user', `The \`${ctx.data.module}\` module is not enabled in this server.`).send(true);
		return false;
	}
	return true;
}

export async function commandCheck(ctx: Context): Promise<boolean> {
	const isDeveloper = DEVELOPER_IDS.includes(ctx.interaction.user.id);
	if (!ctx.data.enabled) {
		await ctx.embedify('warn', 'user', 'This command is disabled.').send(true);
		return false;
	} if (ctx.data.authority === 'DEVELOPER' && !isDeveloper) {
		await ctx.embedify('warn', 'user', 'This command is dev only.').send(true);
		return false;
	} if (!ctx.data.global && !ctx.interaction.inGuild()) {
		await ctx.embedify('warn', 'user', 'This command may only be used within servers.').send(true);
		return false;
	} if (!(await checkPermission(ctx))) {
		return false;
	} if (!isDeveloper || !DEV_COOLDOWN_EXEMPT) {
		const valid = await checkCooldown(ctx);
		if (!valid) return false;
	} else if (!isDeveloper || !DEV_PERMISSION_EXEMPT) {
		const valid = await checkAuthority(ctx);
		if (!valid) return false;
	} else if (!isDeveloper || !DEV_MODULE_EXEMPT) {
		const valid = await validateModule(ctx);
		if (!valid) return false;
	}

	return true;
}
