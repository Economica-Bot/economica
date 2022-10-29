import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	ComponentType,
	ModalSubmitInteraction,
	SelectMenuInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder
} from 'discord.js';

export const ApplyOptions = ({
	command,
	subcommand
}: {
	command: string;
	subcommand: string;
}): ClassDecorator => {
	return (target: any) => {
		Reflect.defineProperty(target, 'command', command);
		Reflect.defineProperty(target, 'subcommand', subcommand);
	};
};

export interface Command<inGuild extends boolean> {
	metadata: SlashCommandBuilder;
	execute: (
		interaction: ChatInputCommandInteraction<
			inGuild extends true ? 'cached' : 'raw'
		>
	) => void | Promise<void>;
}

export interface SubCommandGroup<inGuild extends boolean> {
	metadata: SlashCommandSubcommandGroupBuilder;
	execute: (
		interaction: ChatInputCommandInteraction<
			inGuild extends true ? 'cached' : 'raw'
		>
	) => void | Promise<void>;
}

export declare class SubCommand<inGuild extends boolean> {
	metadata: SlashCommandSubcommandBuilder;
	execute: (
		interaction: ChatInputCommandInteraction<
			inGuild extends true ? 'cached' : 'raw'
		>
	) => void | Promise<void>;
}

export declare class InteractionHandler<T extends ComponentType> {
	execute: (
		interaction: T extends ComponentType.Button
			? ButtonInteraction
			: T extends
					| ComponentType.ChannelSelect
					| ComponentType.MentionableSelect
					| ComponentType.RoleSelect
					| ComponentType.UserSelect
					| ComponentType.StringSelect
			? SelectMenuInteraction
			: T extends ComponentType.TextInput
			? ModalSubmitInteraction
			: never
	) => void | Promise<void>;
}
