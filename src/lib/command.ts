import { GuildMember, PermissionFlagsBits, PermissionsString, TextChannel } from 'discord.js';
import ms from 'ms';

import { DEV_COOLDOWN_EXEMPT, DEV_MODULE_EXEMPT, DEVELOPER_IDS } from '../config';
import { Command } from '../entities';
import { Context } from '../structures';

async function checkPermission(ctx: Context): Promise<boolean> {
	const member = ctx.interaction.member as GuildMember;
	const channel = ctx.interaction.channel as TextChannel;
	const clientPermissions: PermissionsString[] = [];
	const missingClientPermissions: PermissionsString[] = [];
	if (ctx.data.clientPermissions) clientPermissions.push(...ctx.data.clientPermissions);
	clientPermissions.forEach((permission) => {
		if (!ctx.interaction.guild.members.me.permissionsIn(channel).has(permission)) missingClientPermissions.push(permission);
	});
	if (missingClientPermissions.length) {
		await ctx.embedify('warn', 'bot', `Missing Bot Permissions: \`${missingClientPermissions}\``).send(true);
		return false;
	}
	if (ctx.interaction.guild.ownerId === member.id || member.permissions.has(PermissionFlagsBits.Administrator)) {
		return true;
	}
	return true;
}

async function checkCooldown(ctx: Context): Promise<boolean> {
	const { incomes, intervals } = ctx.guildEntity;
	if (!(ctx.interaction.commandName in { ...incomes, ...intervals })) return true;
	const command = await Command.findOne({ order: { createdAt: 'DESC' }, where: { member: { userId: ctx.memberEntity.userId, guildId: ctx.memberEntity.guildId }, command: ctx.interaction.commandName } });
	const createdAt = command?.createdAt;
	if (!createdAt) return true;
	let cooldown: number;
	if (ctx.interaction.commandName in { ...intervals, ...incomes }) {
		Object.keys({ ...intervals, ...incomes }).forEach((k) => {
			if (k === ctx.interaction.commandName) cooldown = { ...intervals, ...incomes }[k].cooldown;
		});
	}
	if (createdAt.getTime() + cooldown > Date.now()) {
		const embed = ctx
			.embedify('warn', 'user', `You may run this command in \`${ms(createdAt.getTime() + cooldown - Date.now())}\``)
			.setFooter({ text: `Cooldown: ${ms(cooldown)}` });
		ctx.interaction.reply({ embeds: [embed], ephemeral: true });
		return false;
	}
	return true;
}

async function validateModule(ctx: Context): Promise<boolean> {
	if (!ctx.guildEntity.modules[ctx.data.module].enabled) {
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
	} if (!ctx.data.global && !ctx.interaction.inGuild()) {
		await ctx.embedify('warn', 'user', 'This command may only be used within servers.').send(true);
		return false;
	} if (!ctx.interaction.inGuild()) {
		return true;
	} if (!(await checkPermission(ctx))) {
		return false;
	} if (!isDeveloper || !DEV_COOLDOWN_EXEMPT) {
		const valid = await checkCooldown(ctx);
		if (!valid) return false;
	} if (!isDeveloper || !DEV_MODULE_EXEMPT) {
		const valid = await validateModule(ctx);
		if (!valid) return false;
	}

	return true;
}
