import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	SelectMenuInteraction
} from 'discord.js';

export interface Command<T extends InteractionInput = InteractionInput> {
	identifier: RegExp;
	readonly type: T;
	execute: (interaction: InteractionForm<T>) => Promise<void> | void;
}

type InteractionInput = 'chatInput' | 'selectMenu' | 'button';

type InteractionForm<T> = T extends 'chatInput'
	? ChatInputCommandInteraction<'cached'>
	: T extends 'selectMenu'
	? SelectMenuInteraction<'cached'>
	: T extends 'button'
	? ButtonInteraction<'cached'>
	: never;
