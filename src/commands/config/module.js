const ms = require('ms');

const guildSettingSchema = require('@schemas/guild-settings-sch');

module.exports = {
	name: 'module',
	group: 'config',
	untoggleable: true,
	description: 'Enable or disable a module.',
	global: true,
	userPermissions: ['MANAGE_GUILD'],
	options: [
		{
			name: 'view',
			description: "View a module's permissions.",
			type: 'SUB_COMMAND',
			options: [
				{
					name: 'module',
					description: 'Specify a module.',
					type: 'STRING',
					required: true,
				},
			],
		},
		{
			name: 'enable',
			description: 'Enable a module.',
			type: 'SUB_COMMAND',
			options: [
				{
					name: 'module',
					description: 'Specify a module.',
					type: 'STRING',
					required: true,
				},
				{
					name: 'channel',
					description: 'Specify a channel.',
					type: 'CHANNEL',
					required: false,
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
			description: 'Disable a module.',
			type: 'SUB_COMMAND',
			options: [
				{
					name: 'module',
					description: 'Specify a module.',
					type: 'STRING',
					required: true,
				},
				{
					name: 'channel',
					description: 'Specify a channel.',
					type: 'CHANNEL',
					required: false,
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
			description: 'Reset a module.',
			type: 'SUB_COMMAND',
			options: [
				{
					name: 'module',
					description: 'Specify a module.',
					type: 'STRING',
					required: true,
				},
			],
		},
	],
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
				let cooldown = true;
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
							cooldown = false;
						} else if (setting === 'disabled') {
							description += `**Server Disabled**: \`${moduleSettings[setting]}\``;
						}
						description += '\n';
					}
				}

				if (cooldown) {
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
							.toUpperCase()}D module \`${module}\` in <#${channel.id}>\n`;
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
