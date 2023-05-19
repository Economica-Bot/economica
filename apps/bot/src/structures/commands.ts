import { Guild, Member, User } from '@economica/db';
import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	ColorResolvable,
	EmbedBuilder,
	ModalMessageModalSubmitInteraction,
	SelectMenuInteraction
} from 'discord.js';

type RegExpGroups<T extends string> = {
	groups: { [name in T]: string } | { [key: string]: string };
};

type InGuild = boolean;
type Nullish<T> = T | null | undefined;

export interface Context<
	T extends InteractionInput,
	I extends InGuild = true,
	K extends string = string
> {
	interaction: InteractionForm<T, I>;
	args: RegExpGroups<K>;
	guildEntity: I extends true ? Guild : Nullish<Guild>;
	userEntity: User;
	clientUserEntity: User;
	memberEntity: I extends true ? Member : Nullish<Member>;
	clientMemberEntity: I extends true ? Member : Nullish<Member>;
}

export interface Command<
	T extends InteractionInput = InteractionInput,
	I extends InGuild = true,
	K extends string = string
> {
	identifier: RegExp;
	readonly type: T;
	execute: (ctx: Context<T, I, K>) => Promise<void> | void;
}

type InteractionInput = 'chatInput' | 'selectMenu' | 'button' | 'modal';

type InteractionForm<
	T extends InteractionInput,
	I extends InGuild = InGuild
> = T extends 'chatInput'
	? I extends true
		? ChatInputCommandInteraction<'cached'>
		: ChatInputCommandInteraction
	: T extends 'selectMenu'
	? I extends true
		? SelectMenuInteraction<'cached'>
		: SelectMenuInteraction
	: T extends 'button'
	? I extends true
		? ButtonInteraction<'cached'>
		: ButtonInteraction
	: T extends 'modal'
	? I extends true
		? ModalMessageModalSubmitInteraction<'cached'>
		: ModalMessageModalSubmitInteraction
	: never;

export enum ReplyContext {
	PRIMARY,
	SECONDARY,
	SUCCESS,
	DANGER,
	WARNING,
	INFO
}

export const ReplyColor: Record<keyof typeof ReplyContext, ColorResolvable> = {
	PRIMARY: 'Blurple',
	SECONDARY: 'DarkerGrey',
	SUCCESS: 'Green',
	DANGER: 'DarkRed',
	WARNING: 'Yellow',
	INFO: 'Aqua'
};

export enum ReplyFooter {
	BOT,
	SERVER,
	USER
}

export const embedify = <T extends InteractionInput>(
	interaction: InteractionForm<T>,
	context: keyof typeof ReplyContext,
	footer: ReplyFooter,
	description: string
): EmbedBuilder => {
	const embed = new EmbedBuilder()
		.setColor(ReplyColor[context])
		.setDescription(description);

	switch (footer) {
		case ReplyFooter.BOT:
			embed.setFooter({
				text: interaction.client.user.tag,
				iconURL: interaction.client.user.displayAvatarURL()
			});
		case ReplyFooter.SERVER:
			if (!interaction.guild) throw new Error('Interaction is not in a guild');
			embed.setFooter({
				text: interaction.guild.name,
				iconURL: interaction.guild.iconURL() ?? ''
			});
		case ReplyFooter.USER:
			embed.setFooter({
				text: interaction.user.tag,
				iconURL: interaction.client.user.displayAvatarURL()
			});
	}

	return embed;
};
