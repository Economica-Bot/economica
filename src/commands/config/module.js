const fs = require('fs');
const path = require('path');
const guildSettingSchema = require('../../util/mongo/schemas/guild-settings-sch');

const {
	SlashCommandBuilder,
	SlashCommandIntegerOption,
} = require('@discordjs/builders');
const commands = require('../../config/commands');
const { IntegrationApplication } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('module')
		.setDescription(commands.commands.module.description)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('view')
				.setDescription("View a command's permissions.")
				.addStringOption((option) =>
					option
						.setName('command')
						.setDescription('Specify a command.')
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('enable')
				.setDescription('Enable a module.')
				.addStringOption((option) =>
					option
						.setName('module')
						.setDescription('Specify a module.')
						.setRequired(true)
				)
				.addChannelOption((option) =>
					option.setName('channel').setDescription('Specify a channel.')
				)
				.addRoleOption((option) =>
					option.setName('role').setDescription('Specify a role.')
				)
				.addStringOption((option) =>
					option.setName('cooldown').setDescription('Specify a cooldown.')
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('disable')
				.setDescription('Disable a module.')
				.addStringOption((option) =>
					option
						.setName('module')
						.setDescription('Specify a module.')
						.setRequired(true)
				)
				.addChannelOption((option) =>
					option.setName('channel').setDescription('Specify a channel.')
				)
				.addRoleOption((option) =>
					option.setName('role').setDescription('Specify a role.')
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('reset')
				.setDescription('Reset a module.')
				.addStringOption((option) =>
					option
						.setName('module')
						.setDescription('Specify a module.')
						.setRequired(true)
				)
		),
	async run(interaction) {
		let color = 'GREEN',
			title = interaction.member.user.tag,
			icon_url = interaction.member.user.displayAvatarURL(),
			description = '',
			footer = '',
			guildID = interaction.guild.id;

		const module = [
			'casino',
			'economy',
			'income',
			'moderation',
			'shop',
			'statistics',
			'utility',
		].find((mod) => mod === interaction.options.getString('module'));

		if (!module) {
			color = 'RED';
			description = `Command module \`${interaction.options.getString(
				'module'
			)}\` not found or cannot be toggled.`;
			footer = 'Use help for a list of command modules.';
		} else {
			const guildSettings = await guildSettingSchema.findOneAndUpdate(
				{ guildID },
				{
					$pull: {
						modules: {
							module: module,
						},
					},
				}
			);

			const moduleSettings = guildSettings.modules.find((m) => {
				return m.module === module;
			}) ?? {
				module: module,
			};

			//View permissions for a module
			if (interaction.options.getSubcommand() === 'view') {
				for (const setting in moduleSettings) {
					if (moduleSettings[setting] instanceof Array) {
						for (const set of moduleSettings[setting]) {
							description += set.channel
								? `<#${set.channel}>: \`${
										set.disabled ? 'Disabled' : 'Enabled'
								  }\``
								: `<@&${set.role}>: \`${
										set.disabled ? 'Disabled' : 'Enabled'
								  }\``;
							description += '\n';
						}
					} else {
						if (setting === 'module') {
							description += `**Module**: \`${moduleSettings[setting]}\``;
						} else if (setting === 'cooldown') {
							description += `**Cooldown**: \`${ms(moduleSettings[setting])}\``;
						} else if (setting === 'disabled') {
							description += `**Server Disabled**: \`${moduleSettings[setting]}\``;
						}
						description += '\n';
					}
				}

				if (description.indexOf('cooldown') == -1) {
					description += '**Cooldown**: `5s` *(Default)*';
				}
			}

			//Change permissions for a module
			else {
				//Enable or disable a channel for a module
				if (interaction.options.getChannel('channel')) {
					const channel = interaction.options.getChannel('channel');
					if (!channel.isText()) {
						color = 'RED';
						description += `\`${channel.name}\` is not a text channel.\n`;
					} else {
						if (!moduleSettings.channels) {
							moduleSettings.channels = [];
						}
						if (moduleSettings.channels.find((c) => c.channel === channel.id)) {
							moduleSettings.channels.find(
								(c) => c.channel === channel.id
							).disabled =
								interaction.options.getSubcommand() === 'disable'
									? true
									: false;
						} else {
							moduleSettings.channels.push({
								channel: channel.id,
								disabled:
									interaction.options.getSubcommand() === 'disable'
										? true
										: false,
							});
						}
						description += `${interaction.options
							.getSubcommand()
							.toUpperCase()}D module \`${cmd.name}\` in <#${channel.id}>\n`;
					}
				}

				//Enable or disable a role for a command
				if (interaction.options.getRole('role')) {
					const role = interaction.options.getRole('role');
					if (!moduleSettings.roles) {
						moduleSettings.roles = [];
					}
					if (moduleSettings.roles.find((r) => r.channel === role.id)) {
						moduleSettings.roles.find((r) => r.role === role.id).disabled =
							interaction.options.getSubcommand() === 'disable' ? true : false;
					} else {
						moduleSettings.roles.push({
							role: role.id,
							disabled:
								interaction.options.getSubcommand() === 'disable'
									? true
									: false,
						});
					}
					description += `${interaction.options
						.getSubcommand()
						.toUpperCase()}D module \`${module}\` for <@&${role.id}>\n`;
				}

				//Add a cooldown to a command
				if (interaction.options.getString('cooldown')) {
					const cooldown = ms(interaction.options.getString('cooldown'));
					moduleSettings.cooldown = cooldown;
					description += `${interaction.options
						.getSubcommand()
						.toUpperCase()}D cooldown of \`${ms(
						cooldown
					)}\` for module \`${module}\`\n`;
				}

				//Enable or disable a command
				if (interaction.options._hoistedOptions.length === 1) {
					moduleSettings.disabled =
						interaction.options.getSubcommand() === 'disable' ? true : false;
					description += `${interaction.options
						.getSubcommand()
						.toUpperCase()}D module \`${module}\``;
				}
			}

			if (interaction.options.getSubcommand() !== 'reset') {
				await guildSettingSchema.findOneAndUpdate(
					{ guildID },
					{
						$push: {
							modules: {
								...moduleSettings,
							},
						},
					}
				);
			} else {
				description = `Reset module \`${module}\``;
			}
		}

		const embed = util.embedify(color, title, icon_url, description, footer);

		await interaction.reply({ embeds: [embed] });
	},
};
