import {
	APIAttachment,
	APIChannel,
	APIChatInputApplicationCommandInteraction,
	APIGuildMember,
	APIInteractionDataOptionBase,
	APIRole,
	APIUser,
	ApplicationCommandOptionType
} from 'discord-api-types/v10';

declare type optionTypeMapper<
	type extends Exclude<
		ApplicationCommandOptionType,
		'subcommand' | 'subcommandgroup'
	>
> = type extends ApplicationCommandOptionType.Attachment
	? APIInteractionDataOptionBase<type, APIAttachment>
	: type extends ApplicationCommandOptionType.Boolean
	? APIInteractionDataOptionBase<type, boolean>
	: type extends ApplicationCommandOptionType.Channel
	? APIInteractionDataOptionBase<type, APIChannel>
	: type extends ApplicationCommandOptionType.Integer
	? APIInteractionDataOptionBase<type, number>
	: type extends ApplicationCommandOptionType.Mentionable
	? APIInteractionDataOptionBase<type, APIRole | APIGuildMember | APIChannel>
	: type extends ApplicationCommandOptionType.Number
	? APIInteractionDataOptionBase<type, number>
	: type extends ApplicationCommandOptionType.Role
	? APIInteractionDataOptionBase<type, APIRole>
	: type extends ApplicationCommandOptionType.String
	? APIInteractionDataOptionBase<type, string>
	: type extends ApplicationCommandOptionType.User
	? APIInteractionDataOptionBase<type, APIUser>
	: never;

export const getChatInputOption = <
	optionType extends Exclude<
		ApplicationCommandOptionType,
		'subcommand' | 'subcommandgroup'
	>,
	error extends boolean = false
>(
	interaction: APIChatInputApplicationCommandInteraction,
	name: string,
	type: optionType,
	required?: error
): error extends true
	? optionTypeMapper<optionType>['value']
	: optionTypeMapper<optionType>['value'] | null => {
	if (!interaction.data.options) {
		if (required) throw new Error('No options on this bad boy');
		else return null;
	}
	const option = interaction.data.options.find(
		(option) => option.name === name && option.type === type
	);
	if (!option) {
		if (required) throw new Error('Could not find option');
		else return null;
	} else if (
		option.type === ApplicationCommandOptionType.Subcommand ||
		option.type === ApplicationCommandOptionType.SubcommandGroup
	)
		return null;
	return option.value;
};
