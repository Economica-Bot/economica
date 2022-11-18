import { ChatInputCommandInteraction } from 'discord.js';

export interface Command {
	name: string;
	execute: (
		interaction: ChatInputCommandInteraction<'cached'>
	) => Promise<void> | void;
}
