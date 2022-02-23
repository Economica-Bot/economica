import { Context } from '../structures/index.js';
import { transaction } from './index.js';

export async function interval(
	ctx: Context,
	type: 'INTERVAL_MINUTE' | 'INTERVAL_HOUR' | 'INTERVAL_DAY' | 'INTERVAL_WEEK' | 'INTERVAL_FORTNIGHT' | 'INTERVAL_MONTH',
): Promise<void> {
	const { amount } = ctx.guildDocument.intervals[type];
	await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.clientDocument, type, amount, 0);
	return ctx.embedify('success', 'user', `You earned ${ctx.guildDocument.currency}${amount}!`, false);
}
