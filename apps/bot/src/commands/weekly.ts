import { interval } from '../lib/interval';
import { Command } from '../structures/commands';

export const Weekly = {
	identifier: /^weekly$/,
	type: 'chatInput',
	execute: async (interaction) => interval(interaction, 'weekly')
} satisfies Command<'chatInput'>;
