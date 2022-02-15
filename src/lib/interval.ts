import { Message } from 'discord.js';

import { transaction } from '.';
import { Context } from '../structures';

export async function interval(
	ctx: Context,
	type: 'minutely' | 'hourly' | 'daily' | 'weekly' | 'fortnightly' | 'monthly'
): Promise<void> {
	const amount = ctx.guildDocument.intervals[type].amount;
	await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.clientDocument, 'INTERVAL_MINUTE', amount, 0);
	return await ctx.embedify('success', 'user', `You earned ${ctx.guildDocument.currency}${amount}!`, false);
}
