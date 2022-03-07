import { parseNumber } from '@adrastopoulos/number-parser';

import { Context } from '../structures/index.js';
import { TransactionString, defaultIntervals } from '../typings/index.js';
import { transaction } from './index.js';

const intervals: Record<keyof defaultIntervals, TransactionString> = {
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
	const { amount } = ctx.guildEntity.intervals[type];
	await transaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, intervals[type], amount, 0);
	return ctx.embedify('success', 'user', `You earned ${ctx.guildEntity.currency}${parseNumber(amount)}!`, false);
}
