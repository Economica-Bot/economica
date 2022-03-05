import { parseString } from '@adrastopoulos/number-parser';
import { GuildMember } from 'discord.js';

import { Member } from '../entities';
import { Context } from '../structures';
import { Moderation } from '../typings';

export async function validateAmount(
	ctx: Context,
	target: 'wallet' | 'treasury',
): Promise<{ validated: boolean; result?: number }> {
	const { [target]: balance } = await Member.findOne({ id: ctx.interaction.user.id });
	const amount = ctx.interaction.options.getString('amount');
	const result = amount === 'all' ? balance : parseString(amount);

	if (!result && result !== 0) {
		await ctx.embedify('error', 'user', 'Please enter a valid input.', true);
		return { validated: false };
	}
	if (result < 1) {
		await ctx.embedify('error', 'user', 'Input less than 1.', true);
		return { validated: false };
	} if (result > balance) {
		await ctx.embedify('error', 'user', `Input exceeds current ${target}: ${ctx.guildEntity.currency}${balance.toLocaleString()}`, true);
		return { validated: false };
	}
	return { validated: true, result };
}

export async function validateTarget(ctx: Context): Promise<boolean> {
	const type = ctx.interaction.commandName as Moderation;
	const member = (await ctx.interaction.guild.members.fetch(ctx.client.user.id)) as GuildMember;
	const target = ctx.interaction.options.getMember('target') as GuildMember;

	if (target.id === ctx.interaction.user.id) {
		await ctx.embedify('warn', 'user', 'You cannot target yourself.', true);
		return false;
	} if (target.id === ctx.client.user.id) {
		await ctx.embedify('warn', 'user', 'You cannot target me.', true);
		return false;
	} if (target.roles.highest.position > member.roles.highest.position) {
		await ctx.embedify('warn', 'user', "Target's roles are too high.", true);
		return false;
	} if (type === 'ban' && !target.bannable) {
		await ctx.embedify('warn', 'user', 'Target is unbannable.', true);
		return false;
	} if (type === 'kick' && !target.kickable) {
		await ctx.embedify('warn', 'user', 'Target is unkickable.', true);
		return false;
	} if (type === 'timeout') {
		if (!target.moderatable) {
			await ctx.embedify('warn', 'user', 'Target is unmoderatable.', true);
			return false;
		} if (target.communicationDisabledUntil && target.communicationDisabledUntil.getTime() > Date.now()) {
			await ctx.embedify('warn', 'user', 'Target is already in a timeout.', true);
			return false;
		}
	} else if (type === 'untimeout') {
		if (target.isCommunicationDisabled) {
			await ctx.embedify('warn', 'user', 'Target is not in a timeout.', true);
			return false;
		}
	}

	return true;
}
