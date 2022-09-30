import { parseNumber } from '@adrastopoulos/number-parser';

import { recordTransaction } from '.';
import { Context } from '../structures';
import { Emojis, Intervals, TransactionString } from '../typings';

const intervals: Record<keyof Intervals, TransactionString> = {
	daily: 'INTERVAL_MINUTE',
	fortnightly: 'INTERVAL_FORTNIGHT',
	hourly: 'INTERVAL_HOUR',
	minutely: 'INTERVAL_MINUTE',
	monthly: 'INTERVAL_MONTH',
	weekly: 'INTERVAL_WEEK',
};

export async function interval(ctx: Context, type: keyof typeof intervals) {
	if (!ctx.guildEntity.intervals[type].enabled) throw new Error('This interval command is disabled.');
	else {
		const { amount } = ctx.guildEntity.intervals[type];
		recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, intervals[type], amount, 0);
		return `${Emojis.TIME} You earned ${ctx.guildEntity.currency} \`${parseNumber(amount)}\`!`;
	}
}
