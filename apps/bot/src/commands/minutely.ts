import { interval } from '../lib/interval';
import { Command } from '../structures/commands';

export const Minutely = {
	identifier: /^minutely$/,
	type: 'chatInput',
	execute: async (interaction) => interval(interaction, 'minutely')
} satisfies Command<'chatInput'>;
