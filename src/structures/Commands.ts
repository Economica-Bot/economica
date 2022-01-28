import { parseString } from '@adrastopoulos/number-parser';
import { BalanceString, Context, EconomicaCommand } from '.';
import { getEconInfo } from '../lib/util';

export class EconomyCommand extends EconomicaCommand {
	public async validateAmount(ctx: Context, target: BalanceString): Promise<{ validated: boolean; result?: number }> {
		const { [target]: balance } = await getEconInfo(ctx.interaction.guildId, ctx.interaction.user.id);
		const amount = ctx.interaction.options.getString('amount');
		const result = amount === 'all' ? balance : parseString(amount);

		if (result) {
			if (result < 1) {
				await ctx.embedify('error', 'user', `Amount less than 0`);
				return { validated: false };
			} else if (result > balance) {
				await ctx.embedify(
					'error',
					'user',
					`Exceeds current ${target}:${ctx.guildDocument.currency}${balance.toLocaleString()}`
				);

				return { validated: false };
			}
		} else {
			await ctx.embedify('error', 'user', 'Please enter a valid amount.');
			return { validated: false };
		}

		return { validated: true, result };
	}
}
