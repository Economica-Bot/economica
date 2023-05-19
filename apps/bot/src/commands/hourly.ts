import { interval } from '../lib/interval';
import { Command } from '../structures/commands';

export const Hourly = {
	identifier: /^hourly$/,
	type: 'chatInput',
	execute: async (ctx) => interval(ctx, 'hourly')
} satisfies Command<'chatInput'>;
