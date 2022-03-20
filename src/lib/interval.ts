import { parseNumber } from '@adrastopoulos/number-parser';

import { Context } from '../structures/index.js';
import { TransactionString, Intervals } from '../typings/index.js';
import { recordTransaction } from './index.js';

const intervals: Record<keyof Intervals, TransactionString> = {
	daily: 'INTERVAL_MINUTE',
	fortnightly: 'INTERVAL_FORTNIGHT',
	hourly: 'INTERVAL_HOUR',
	minutely: 'INTERVAL_MINUTE',
	monthly: 'INTERVAL_MONTH',
	weekly: 'INTERVAL_WEEK',
};

export async function interval(
	ctx: Context,
	type: keyof typeof intervals,
): Promise<void> {
	if (!ctx.guildEntity.intervals[type].enabled) {
		await ctx.embedify('warn', 'user', 'This interval command is disabled.').send(true);
	} else {
		const { amount } = ctx.guildEntity.intervals[type];
		recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, intervals[type], amount, 0);
		await ctx.embedify('success', 'user', `You earned ${ctx.guildEntity.currency}${parseNumber(amount)}!`).send(false);
	}
}
