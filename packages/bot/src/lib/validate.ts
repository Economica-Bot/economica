import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';

import { Context } from '../structures';

export async function validateAmount(
	ctx: Context,
	target: 'wallet' | 'treasury',
) {
	const { [target]: balance } = ctx.memberEntity;
	const amount = ctx.interaction.data.options
		.filter((option) => option.type === ApplicationCommandOptionType.String)
		.find((option) => option.name === 'amount')
		.value;
	const result = amount === 'all' ? balance : parseString(amount);
	if (result === null || result === undefined) throw new Error('Please enter a valid input');
	if (result < 1) throw new Error('Input less than 1.');
	if (result > balance) throw new Error(`Input exceeds current ${target}: ${parseNumber(balance)}`);
	return result;
}
