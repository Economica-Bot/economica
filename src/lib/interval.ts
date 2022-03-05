import { Context } from '../structures';
import { transaction } from '.';

export async function interval(
	ctx: Context,
	type: 'INTERVAL_MINUTE' | 'INTERVAL_HOUR' | 'INTERVAL_DAY' | 'INTERVAL_WEEK' | 'INTERVAL_FORTNIGHT' | 'INTERVAL_MONTH',
): Promise<void> {
	const { amount } = ctx.guildEntity.intervals[type];
	await transaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, type, amount, 0);
	return ctx.embedify('success', 'user', `You earned ${ctx.guildEntity.currency}${amount}!`, false);
}
