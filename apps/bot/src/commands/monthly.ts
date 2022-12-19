import { interval } from '../lib/interval';
import { Command } from '../structures/commands';

export const Monthly = {
	identifier: /^monthly$/,
	type: 'chatInput',
	execute: async (interaction) => interval(interaction, 'monthly')
} satisfies Command<'chatInput'>;
