import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { ChatInputCommandInteraction } from 'discord.js';

import { CommandError, Context } from '../structures';
import { Moderation } from '../typings';

export async function validateAmount(
	ctx: Context<ChatInputCommandInteraction<'cached'>>,
	target: 'wallet' | 'treasury',
) {
	const { [target]: balance } = ctx.memberEntity;
	const amount = ctx.interaction.options.getString('amount');
	const result = amount === 'all' ? balance : parseString(amount);
	if (result === null || result === undefined) throw new CommandError('Please enter a valid input');
	if (result < 1) throw new CommandError('Input less than 1.');
	if (result > balance) throw new CommandError(`Input exceeds current ${target}: ${parseNumber(balance)}`);
	return result;
}

export async function validateTarget(ctx: Context<ChatInputCommandInteraction<'cached'>>, memberRequired = true) {
	const type = ctx.interaction.commandName as Moderation;
	const member = ctx.interaction.guild.members.me;
	const target = ctx.interaction.options.getMember('target');
	const targetUser = ctx.interaction.options.getUser('target');
	if (!target && (!targetUser || memberRequired)) throw new CommandError('Target not found');
	if (targetUser.id === ctx.interaction.user.id) throw new CommandError('You cannot target yourself');
	if (targetUser.id === ctx.interaction.client.user.id) throw new CommandError('You cannot target me');
	if (target) {
		if (target.roles.highest.position > member.roles.highest.position) throw new CommandError("Target's roles are too high");
		if (type === 'ban' && !target.bannable) throw new CommandError('Target is unbannable');
		if (type === 'kick' && !target.kickable) throw new CommandError('Target is unkickable');
		if (type === 'timeout') {
			if (!target.moderatable) throw new CommandError('Target is unmoderatable');
			if (target.isCommunicationDisabled()) throw new CommandError('Target is already in a timeout');
		} else if (type === 'untimeout' && !target.isCommunicationDisabled()) throw new CommandError('Target is not in a timeout');
	}

	return target;
}
