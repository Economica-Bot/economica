import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { APIChatInputApplicationCommandGuildInteraction } from 'discord-api-types/v10';

import { CommandError, Context } from '../structures';

export async function validateAmount(
	ctx: Context<APIChatInputApplicationCommandGuildInteraction>,
	target: 'wallet' | 'treasury',
) {
	const { [target]: balance } = ctx.memberEntity;
	const amount = ctx.interaction.data.options.find((option) => option.name === 'amount').value;
	const result = amount === 'all' ? balance : parseString(amount);
	if (result === null || result === undefined) throw new CommandError('Please enter a valid input');
	if (result < 1) throw new CommandError('Input less than 1.');
	if (result > balance) throw new CommandError(`Input exceeds current ${target}: ${parseNumber(balance)}`);
	return result;
}
