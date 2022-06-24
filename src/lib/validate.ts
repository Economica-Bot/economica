import { parseNumber, parseString } from '@adrastopoulos/number-parser';

import { Context } from '../structures/index.js';
import { Moderation } from '../typings/index.js';

export async function validateAmount(
	ctx: Context,
	target: 'wallet' | 'treasury',
): Promise<{ validated: boolean; result?: number }> {
	const { [target]: balance } = ctx.memberEntity;
	const amount = ctx.interaction.options.getString('amount');
	const result = amount === 'all' ? balance : parseString(amount);
	if (!result && result !== 0) {
		await ctx.embedify('error', 'user', 'Please enter a valid input.').send(true);
		return { validated: false };
	} if (result < 1) {
		await ctx.embedify('error', 'user', 'Input less than 1.').send(true);
		return { validated: false };
	} if (result > balance) {
		await ctx.embedify('error', 'user', `Input exceeds current ${target}: ${ctx.guildEntity.currency}${parseNumber(balance)}`).send(true);
		return { validated: false };
	} return { validated: true, result };
}

export async function validateTarget(ctx: Context, memberRequired = true): Promise<boolean> {
	const type = ctx.interaction.commandName as Moderation;
	const member = ctx.interaction.guild.members.me;
	const target = ctx.interaction.options.getMember('target');
	const targetUser = ctx.interaction.options.getUser('target');
	if (!target && (!targetUser || memberRequired)) {
		await ctx.embedify('error', 'user', 'Target not found.').send(true);
		return false;
	} if (targetUser.id === ctx.interaction.user.id) {
		await ctx.embedify('warn', 'user', 'You cannot target yourself.').send(true);
		return false;
	} if (targetUser.id === ctx.client.user.id) {
		await ctx.embedify('warn', 'user', 'You cannot target me.').send(true);
		return false;
	} if (target) {
		if (target.roles.highest.position > member.roles.highest.position) {
			await ctx.embedify('warn', 'user', "Target's roles are too high.").send(true);
			return false;
		} if (type === 'ban' && !target.bannable) {
			await ctx.embedify('warn', 'user', 'Target is unbannable.').send(true);
			return false;
		} if (type === 'kick' && !target.kickable) {
			await ctx.embedify('warn', 'user', 'Target is unkickable.').send(true);
			return false;
		} if (type === 'timeout') {
			if (!target.moderatable) {
				await ctx.embedify('warn', 'user', 'Target is unmoderatable.').send(true);
				return false;
			} if (target.communicationDisabledUntil && target.communicationDisabledUntil.getTime() > Date.now()) {
				await ctx.embedify('warn', 'user', 'Target is already in a timeout.').send(true);
				return false;
			}
		} else if (type === 'untimeout') {
			if (!target.isCommunicationDisabled) {
				await ctx.embedify('warn', 'user', 'Target is not in a timeout.').send(true);
				return false;
			}
		}
	}

	return true;
}
