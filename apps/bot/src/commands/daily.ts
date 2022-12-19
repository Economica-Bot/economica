import { interval } from '../lib/interval';
import { Command } from '../structures/commands';

export const Daily = {
	identifier: /^daily$/,
	type: 'chatInput',
	execute: async (interaction) => interval(interaction, 'daily')
} satisfies Command<'chatInput'>;
