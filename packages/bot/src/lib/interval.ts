import { parseNumber } from '@adrastopoulos/number-parser';

import { CommandError, Context } from '../structures';
import { TransactionString, Intervals, Emojis } from '../typings';
import { recordTransaction } from '.';

const intervals: Record<keyof Intervals, TransactionString> = {
	daily: 'INTERVAL_MINUTE',
	fortnightly: 'INTERVAL_FORTNIGHT',
	hourly: 'INTERVAL_HOUR',
	minutely: 'INTERVAL_MINUTE',
	monthly: 'INTERVAL_MONTH',
	weekly: 'INTERVAL_WEEK',
};

export async function interval(ctx: Context, type: keyof typeof intervals) {
	if (!ctx.guildEntity.intervals[type].enabled) throw new CommandError('This interval command is disabled.');
	else {
		const { amount } = ctx.guildEntity.intervals[type];
		recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, intervals[type], amount, 0);
		return `${Emojis.TIME} You earned ${ctx.guildEntity.currency} \`${parseNumber(amount)}\`!`;
	}
}
