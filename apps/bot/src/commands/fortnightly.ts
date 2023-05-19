import { interval } from '../lib/interval';
import { Command } from '../structures/commands';

export const Fortnightly = {
	identifier: /^fortnightly$/,
	type: 'chatInput',
	execute: async (ctx) => interval(ctx, 'fortnightly')
} satisfies Command<'chatInput'>;
