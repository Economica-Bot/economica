import { ModuleString } from '@economica/common';
import {
	ApplicationCommandOptionType,
	ChannelType,
	PermissionFlagsBits,
	RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord-api-types/v10';

export const commandData: (RESTPostAPIChatInputApplicationCommandsJSONBody & {
	module: ModuleString;
	format?: string;
	examples?: string[];
})[] = [
	{
		name: 'add-money',
		description: 'Manipulate balances',
		module: 'ECONOMY',
		format: '<user> <amount> <target>',
		examples: ['add-money @user 300 wallet', 'add-money @user 100 treasury'],
		default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
		options: [
			{
				type: ApplicationCommandOptionType.User,
				name: 'target',
				description: 'Specify a user',
				required: true
			},
			{
				type: ApplicationCommandOptionType.String,
				name: 'amount',
				description: 'Specify an amount',
				required: true
			},
			{
				type: ApplicationCommandOptionType.String,
				name: 'balance',
				description: 'Specify the balance',
				required: true,
				choices: [
					{ name: 'Wallet', value: 'wallet' },
					{ name: 'Treasury', value: 'treasury' }
				]
			}
		]
	},
	{
		name: 'invite',
		description: 'Get the invite link',
		module: 'UTILITY'
	},
	{
		name: 'module',
		description: 'Manage server modules',
		module: 'UTILITY',
		default_member_permissions: PermissionFlagsBits.Administrator.toString()
	},
	{
		name: 'ping',
		description: 'Pingpong!',
		module: 'UTILITY'
	},
	{
		name: 'purge',
		description: 'Delete messages in a channel',
		module: 'UTILITY',
		format: '[channel] [amount]',
		default_member_permissions: PermissionFlagsBits.ManageMessages.toString(),
		options: [
			{
				type: ApplicationCommandOptionType.Channel,
				name: 'channel',
				description: 'Specify a channel',
				channel_types: [ChannelType.GuildText],
				required: false
			},
			{
				type: ApplicationCommandOptionType.Integer,
				name: 'amount',
				description: 'Specify an amount (default 100)',
				min_value: 1,
				max_value: 100,
				required: false
			}
		]
	}
];
