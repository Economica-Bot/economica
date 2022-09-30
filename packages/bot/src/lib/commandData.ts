import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';

import { EconomicaSlashCommandBuilder } from '../structures';

export const commandData = [
	new EconomicaSlashCommandBuilder()
		.setName('add-money')
		.setDescription('Manipulate balances')
		.setModule('ECONOMY')
		.setFormat('add-money <user> <amount> <target>')
		.setExamples(['add-money @user 300 wallet', 'add-money @user 100 treasury'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addUserOption((option) => option.setName('target').setDescription('Specify a user').setRequired(true))
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true))
		.addStringOption((option) => option
			.setName('balance')
			.setDescription('Specify the balance')
			.setRequired(true)
			.addChoices({ name: 'Wallet', value: 'wallet' }, { name: 'Treasury', value: 'treasury' }))
		.toJSON(),
	new EconomicaSlashCommandBuilder()
		.setName('invite')
		.setDescription('Get the invite link for Economica')
		.setModule('UTILITY')
		.setFormat('invite')
		.toJSON(),
	new EconomicaSlashCommandBuilder()
		.setName('module')
		.setDescription('Manage server modules')
		.setModule('UTILITY')
		.setFormat('module <view | add | remove> [module]')
		.setExamples(['module view', 'module add Interval', 'module remove Interval'])
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.toJSON(),
	new EconomicaSlashCommandBuilder()
		.setName('ping')
		.setDescription('Ping pong!')
		.setModule('UTILITY')
		.setFormat('ping')
		.toJSON(),
	new EconomicaSlashCommandBuilder()
		.setName('purge')
		.setDescription('Delete messages in a channel')
		.setModule('UTILITY')
		.setFormat('purge [channel] [amount]')
		.setExamples(['purge', 'purge #general', 'purge #general 50'])
		.setClientPermissions(PermissionFlagsBits.ManageMessages)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addChannelOption((option) => option
			.setName('channel')
			.setDescription('Specify a channel')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(false))
		.addIntegerOption((option) => option
			.setName('amount')
			.setDescription('Specify an amount (default 100).')
			.setMinValue(1)
			.setMaxValue(100)
			.setRequired(false))
		.toJSON(),
];
