import { interval } from '../lib/interval';
import { Command } from '../structures/commands';

export const Minutely = {
	identifier: /^minutely$/,
	type: 'chatInput',
	execute: async (ctx) => interval(ctx, 'minutely')
} satisfies Command<'chatInput'>;
