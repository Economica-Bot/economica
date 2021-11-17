const fs = require('fs');
const ms = require('ms');
const guildSettingSchema = require('../../util/mongo/schemas/guild-settings-sch');
const incomeSchema = require('../../util/mongo/schemas/income-sch');
const path = require('path');
const config = require(path.join(__dirname, '../../config.json'));
const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../../config/commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('command')
		.setDescription(commands.commands.command.description)
		.addSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('permission')
				.setDescription('Manage command permissions.')
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
						.setDescription('Enable a command.')
						.addStringOption((option) =>
							option
								.setName('command')
								.setDescription('Specify a command.')
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
						.setDescription('Disable a command.')
						.addStringOption((option) =>
							option
								.setName('command')
								.setDescription('Specify a command.')
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
						.setDescription('Reset a command.')
						.addStringOption((option) =>
							option
								.setName('command')
								.setDescription('Specify a command.')
								.setRequired(true)
						)
				)
		)
		.addSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('config')
				.setDescription('Configure a command.')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('income_command')
						.setDescription('Configure an income command.')
						.addStringOption((option) =>
							option
								.setName('command')
								.setDescription('Specify an income command.')
								.setRequired(true)
						)
						.addBooleanOption((option) =>
							option
								.setName('reset')
								.setDescription('Reset this income command.')
						)
						.addIntegerOption((option) =>
							option
								.setName('min')
								.setDescription('Specify the minimum income for this command.')
						)
						.addIntegerOption((option) =>
							option
								.setName('max')
								.setDescription('Specify the maximum income for this command.')
						)
						.addStringOption((option) =>
							option
								.setName('chance')
								.setDescription('Specify the chance for this command.')
						)
						.addIntegerOption((option) =>
							option
								.setName('minfine')
								.setDescription('Specify the minimum fine for this command.')
						)
						.addIntegerOption((option) =>
							option
								.setName('maxfine')
								.setDescription('Specify the minimum fine for this command.')
						)
				)
		),
	async run(interaction) {
		let color = 'GREEN',
			title = interaction.member.user.tag,
			icon_url = interaction.member.user.displayAvatarURL(),
			description = '',
			footer = '',
			guildID = interaction.guild.id;

		const cmd = client.commands.find((command) => {
			return command.name === interaction.options.getString('command');
		});

		if (
			!cmd ||
			cmd?.untoggleable ||
			(interaction.options.getSubcommand() === 'income_command' &&
				cmd.group !== 'income')
		) {
			color = 'RED';
			description = `Command \`${interaction.options.getString(
				'command'
			)}\` is not found or cannot be toggled`;
			footer = 'Use help for a list of commands.';
		} else if (interaction.options.getSubcommandGroup() === 'permission') {
			const guildSettings = await guildSettingSchema.findOneAndUpdate(
				{
					guildID,
				},
				{
					$pull: {
						commands: {
							command: cmd.name,
						},
					},
				},
				{
					upsert: true,
				}
			);

			const commandSettings = guildSettings.commands.find((c) => {
				return c.command === cmd.name;
			}) ?? {
				command: cmd.name,
			};

			//View permissions for a command
			if (interaction.options.getSubcommand() === 'view') {
				for (const setting in commandSettings) {
					if (commandSettings[setting] instanceof Array) {
						for (const set of commandSettings[setting]) {
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
						if (setting === 'command') {
							description += `**Command**: \`${commandSettings[setting]}\``;
						} else if (setting === 'cooldown') {
							description += `**Cooldown**: \`${ms(
								commandSettings[setting]
							)}\``;
						} else if (setting === 'disabled') {
							description += `**Server Disabled**: \`${commandSettings[setting]}\``;
						}
						description += '\n';
					}
				}

				if (description.indexOf('cooldown') == -1) {
					description += '**Cooldown**: `5s` *(Default)*';
				}
			}

			//Change permissions for a command
			else {
				//Enable or disable a channel for a command
				if (interaction.options.getChannel('channel')) {
					const channel = interaction.options.getChannel('channel');
					if (!channel.isText()) {
						color = 'RED';
						description += `\`${channel.name}\` is not a text channel.\n`;
					} else {
						if (!commandSettings.channels) {
							commandSettings.channels = [];
						}
						if (
							commandSettings.channels.find((c) => c.channel === channel.id)
						) {
							commandSettings.channels.find(
								(c) => c.channel === channel.id
							).disabled =
								interaction.options.getSubcommand() === 'disable'
									? true
									: false;
						} else {
							commandSettings.channels.push({
								channel: channel.id,
								disabled:
									interaction.options.getSubcommand() === 'disable'
										? true
										: false,
							});
						}
						description += `${interaction.options
							.getSubcommand()
							.toUpperCase()}D command \`${cmd.name}\` in <#${channel.id}>\n`;
					}
				}

				//Enable or disable a role for a command
				if (interaction.options.getRole('role')) {
					const role = interaction.options.getRole('role');
					if (!commandSettings.roles) {
						commandSettings.roles = [];
					}
					if (commandSettings.roles.find((r) => r.channel === role.id)) {
						commandSettings.roles.find((r) => r.role === role.id).disabled =
							interaction.options.getSubcommand() === 'disable' ? true : false;
					} else {
						commandSettings.roles.push({
							role: role.id,
							disabled:
								interaction.options.getSubcommand() === 'disable'
									? true
									: false,
						});
					}
					description += `${interaction.options
						.getSubcommand()
						.toUpperCase()}D command \`${cmd.name}\` for <@&${role.id}>\n`;
				}

				//Add a cooldown to a command
				if (interaction.options.getString('cooldown')) {
					const cooldown = ms(interaction.options.getString('cooldown'));
					commandSettings.cooldown = cooldown;
					description += `${interaction.options
						.getSubcommand()
						.toUpperCase()}D cooldown of \`${ms(cooldown)}\` for command \`${
						cmd.name
					}\`\n`;
				}

				//Enable or disable a command
				if (interaction.options._hoistedOptions.length === 1) {
					commandSettings.disabled =
						interaction.options.getSubcommand() === 'disable' ? true : false;
					description += `${interaction.options
						.getSubcommand()
						.toUpperCase()}D command \`${cmd.name}\``;
				}
			}

			if (interaction.options.getSubcommand() !== 'reset') {
				await guildSettingSchema.findOneAndUpdate(
					{ guildID },
					{
						$push: {
							commands: {
								...commandSettings,
							},
						},
					}
				);
			} else {
				description = `Reset command \`${cmd.name}\``;
			}
		} else if (interaction.options.getSubcommandGroup() === 'config') {
			if (
				interaction.options.getSubcommand() === 'income_command' &&
				cmd.group !== 'income'
			) {
				description = `Command \`${interaction.options.getString(
					'command'
				)}\` is not an income command`;
			} else {
				let income_command = interaction.options.getString('command');
				let properties = await incomeSchema.findOneAndUpdate(
					{
						guildID: interaction.guild.id,
					},
					{
						$pull: {
							incomeCommands: {
								command: cmd.name,
							},
						},
					}
				);

				properties = Object.entries(
					properties.incomeCommands.find((o) => {
						return o.command === cmd.name;
					})
				);

				let fields = [];
				interaction.options._hoistedOptions.forEach((option) => {
					if (option.name !== 'command')
						fields.push([option.name, option.value]);
				});

				color = 'GREEN';
				description = `Updated ${income_command}`;

				//Validate and transfer provided fields
				updates = '';
				properties.forEach((property) => {
					const field = fields.find((field) => field[0] === property[0]);
					if (field) {
						if (['cooldown'].includes(field[0])) {
							if (ms(field[1])) {
								property[1] = Math.abs(ms(field[1]));
								updates += `${property[0]}: ${ms(ms(property[1]))}ms\n`;
							} else {
								description += `Invalid parameter: \`${field[1]}\`\n\`${field[0]}\` must be a time!\n`;
							}
						} else if (['chance'].includes(field[0])) {
							if (parseFloat(field[1])) {
								property[1] = Math.abs(
									field[1] < 1
										? parseFloat(field[1]) * 100
										: parseFloat(field[1])
								);
								updates += `${property[0]}: ${property[1]}%\n`;
							} else {
								description += `Invalid parameter: \`${field[1]}\`\n\`${field[0]}\` must be a percentage!\n`;
							}
						} else {
							property[1] = Math.abs(+field[1]);
							updates += `${property[0]}: ${property[1]}\n`;
						}
					}
				});

				if (!updates.length) updates = 'No parameters updated';

				properties = Object.fromEntries(properties);

				if (
					interaction.options.getBoolean('reset') != null &&
					interaction.options.getBoolean('reset') === true
				) {
					properties = config.commands[cmd.name];
					properties['command'] = cmd.name;
					updates = `Reset to default\n\n${config.commands[cmd.name]}`;
					description = `\`\`\`Reset ${cmd.name}\`\`\``;
				} else {
					description = `\`\`\`\n${updates}\n\`\`\`${
						description ? `\n${description}` : ''
					}`;
				}

				await incomeSchema
					.findOneAndUpdate(
						{
							guildID: interaction.guild.id,
						},
						{
							$push: {
								incomeCommands: {
									...properties,
								},
							},
						},
						{
							upsert: true,
							new: true,
						}
					)
					.exec();
			}
		}

		const embed = util.embedify(color, title, icon_url, description, footer);

		await interaction.reply({ embeds: [embed] });
	},
};
