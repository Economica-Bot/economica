import { Message } from 'discord.js';

import { transaction } from '.';
import { Context } from '../structures';

export async function interval(
	ctx: Context,
	type: 'minutely' | 'hourly' | 'daily' | 'weekly' | 'fortnightly' | 'monthly'
): Promise<Message> {
	const amount = ctx.guildDocument.intervals[type].amount;
	await transaction(
		ctx.client,
		ctx.interaction.guildId,
		ctx.interaction.user.id,
		ctx.client.user.id,
		'INTERVAL_MINUTE',
		amount,
		0,
		amount
	);

	return await ctx.embedify('success', 'user', `You earned ${ctx.guildDocument.currency}${amount}!`, false);
}
