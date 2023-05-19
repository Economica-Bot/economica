import { interval } from '../lib/interval';
import { Command } from '../structures/commands';

export const Monthly = {
	identifier: /^monthly$/,
	type: 'chatInput',
	execute: async (ctx) => interval(ctx, 'monthly')
} satisfies Command<'chatInput'>;
