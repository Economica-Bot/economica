import { interval } from '../lib/interval';
import { Command } from '../structures/commands';

export const Hourly = {
	identifier: /^hourly$/,
	type: 'chatInput',
	execute: async (interaction) => interval(interaction, 'hourly')
} satisfies Command<'chatInput'>;
