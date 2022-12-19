import { Guild, Member, User } from '@economica/db';
import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	ColorResolvable,
	EmbedBuilder,
	ModalMessageModalSubmitInteraction,
	SelectMenuInteraction
} from 'discord.js';

export interface Command<
	T extends InteractionInput = InteractionInput,
	K extends string = string
> {
	identifier: RegExp;
	readonly type: T;
	execute: (
		interaction: InteractionForm<T>,
		args: RegExpGroups<K>
	) => Promise<void> | void;
}

export type RegExpGroups<T extends string> = {
	groups: { [name in T]: string } | { [key: string]: string };
};

type InteractionInput = 'chatInput' | 'selectMenu' | 'button' | 'modal';

type InteractionForm<T extends InteractionInput> = T extends 'chatInput'
	? ChatInputCommandInteraction<'cached'>
	: T extends 'selectMenu'
	? SelectMenuInteraction<'cached'>
	: T extends 'button'
	? ButtonInteraction<'cached'>
	: T extends 'modal'
	? ModalMessageModalSubmitInteraction<'cached'>
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

export interface Context<T extends InteractionInput = InteractionInput> {
	interaction: InteractionForm<T>;
	guildEntity: Guild;
	userEntity: User;
	clientUserEntity: User;
	memberEntity: Member;
	clientMemberEntity: Member;
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
			embed.setFooter({
				text: interaction.guild.name,
				iconURL: interaction.guild.iconURL() ?? undefined
			});
		case ReplyFooter.USER:
			embed.setFooter({
				text: interaction.user.tag,
				iconURL: interaction.client.user.displayAvatarURL()
			});
	}

	return embed;
};
