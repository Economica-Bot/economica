import { interval } from '../lib/interval';
import { Command } from '../structures/commands';

export const Weekly = {
	identifier: /^weekly$/,
	type: 'chatInput',
	execute: async (ctx) => interval(ctx, 'weekly')
} satisfies Command<'chatInput'>;
