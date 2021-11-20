const ms = require('ms');
const guildSettingSchema = require('@schemas/guild-settings-sch');
const incomeSchema = require('@schemas/income-sch');
const path = require('path');
const config = require(path.join(__dirname, '../../config.json'));

module.exports = {
	name: 'commands',
	group: 'config',
	untoggleable: true,
	description: 'Manage all commands.',
	global: true,
	userPermissions: ['MANAGE_GUILD'],
	options: [
		{
			name: 'view',
			description: 'View all command permissions.',
			type: 'SUB_COMMAND',
			options: null,
		},
		{
			name: 'enable',
			description: 'Enable all commands.',
			type: 'SUB_COMMAND',
			options: [
				{
					name: 'channel',
					description: 'Specify a channel.',
					type: 'CHANNEL',
					required: false,
					channel_types: [0],
				},
				{
					name: 'role',
					description: 'Specify a role.',
					type: 'ROLE',
					required: false,
				},
				{
					name: 'cooldown',
					description: 'Specify a cooldown.',
					type: 'STRING',
					required: false,
				},
			],
		},
		{
			name: 'disable',
			description: 'Disable all commands.',
			type: 'SUB_COMMAND',
			options: [
				{
					name: 'channel',
					description: 'Specify a channel.',
					type: 'CHANNEL',
					required: false,
					channel_types: [0],
				},
				{
					name: 'role',
					description: 'Specify a role.',
					type: 'ROLE',
					required: false,
				},
			],
		},
		{
			name: 'reset',
			description: 'Reset all commands.',
			type: 'SUB_COMMAND',
			options: null,
		},
	],
	async run(interaction) {
		let color = 'GREEN',
			title = interaction.member.user.tag,
			icon_url = interaction.member.user.displayAvatarURL(),
			description = '',
			footer = '';
		const channel = interaction.options.getChannel('channel');
		const role = interaction.options.getRole('role');
		const disable =
			interaction.options.getSubcommand() === 'disable' ? true : false;
		const cooldown = interaction.options.getString('cooldown')
			? ms(interaction.options.getString('cooldown'))
			: null;
		const guildID = interaction.guild.id;
		const guildSettings = await guildSettingSchema.findOneAndUpdate(
			{
				guildID,
			},
			{
				disabled: false,
				roles: [],
				channels: [],
				cooldown: 5 * 1000,
			},
			{
				upsert: true,
			}
		);

		if (interaction.options.getSubcommand() === 'view') {
			for (const channelSetting of guildSettings.channels) {
				description += `<#${channelSetting.channel}>: \`${
					channelSetting.disabled ? 'Disabled' : 'Enabled'
				}\`\n`;
			}

			for (const roleSetting of guildSettings.roles) {
				description += `<#${roleSetting.role}>: \`${
					roleSetting.disabled ? 'Disabled' : 'Enabled'
				}\`\n`;
			}

			description += `Cooldown: \`${ms(guildSettings.cooldown)}\``;
		} else {
			if (channel) {
				if (guildSettings.channels.find((c) => c.channel === channel.id)) {
					guildSettings.channels.find(
						(c) => c.channel === channel.id
					).disabled = disable;
				} else {
					guildSettings.channels.push({
						channel: channel.id,
						disabled: disable,
					});
				}

				description += `${interaction.options
					.getSubcommand()
					.toUpperCase()}D commands in <#${channel.id}>\n`;
			}

			if (role) {
				if (guildSettings.roles.find((r) => r.role === role.id)) {
					guildSettings.roles.find((r) => r.role === role.id).disabled =
						disable;
				} else {
					guildSettings.roles.push({
						role: role.id,
						disabled: disable,
					});
				}

				description += `${interaction.options
					.getSubcommand()
					.toUpperCase()}D commands for <@&${role.id}>\n`;
			}

			if (cooldown) {
				guildSettings.cooldown = cooldown;
				description += `${interaction.options
					.getSubcommand()
					.toUpperCase()}D cooldown of \`${ms(cooldown)}\`\n`;
			}

			if (interaction.options._hoistedOptions.length === 0) {
				guildSettings.disabled = disable;
				description += `${interaction.options
					.getSubcommand()
					.toUpperCase()}D all commands.`;
			}
		}

		if (interaction.options.getSubcommand() !== 'reset') {
			await guildSettingSchema.findOneAndUpdate(
				{ guildID },
				{
					disabled: guildSettings.disabled,
					roles: guildSettings.roles,
					channels: guildSettings.channels,
					cooldown: guildSettings.cooldown,
				}
			);
		} else {
			description = `Reset commands.`;
		}

		const embed = util.embedify(color, title, icon_url, description, footer);
		await interaction.reply({ embeds: [embed] });
	},
};
