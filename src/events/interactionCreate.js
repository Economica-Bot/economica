const ms = require('ms');
const guildSettingsSchema = require('../util/mongo/schemas/guild-settings-sch');
const config = require('../config.json');
const commands = require('../config/commands');

module.exports = {
	name: 'interactionCreate',
	async run(interaction) {
		if (!interaction.isCommand()) {
			return;
		}

		const command = commands.commands.find(cmd => cmd.name === interaction.commandName);

		//Check permission
		if (!(await permissible(interaction, client))) {
			return;
		}

		//Check cooldown
		if (!(await coolDown(interaction))) {
			return;
		}

		if (interaction.inGuild()) {
			const properties = {
				command: interaction.commandName,
				timestamp: new Date().getTime(),
			};

			await util.setUserCommandStats(
				interaction.guild.id,
				interaction.member.id,
				properties
			);
		}

		await command
			?.run(interaction)
			.catch(async (error) => await util.runtimeError(error, interaction));
	},
};

const permissible = async (interaction) => {
	let missingClientPermissions = [],
		missingUserPermissions = [],
		missingRoles = [],
		disabledRoles = [],
		permissible = '';

	const command = commands.commands.find(cmd => cmd.name === interaction.commandName);

	if (!command.settings.global && !interaction.inGuild()) {
		permissible += 'This command is only available in servers.\n';
	}

	const guildSettings = await guildSettingsSchema.findOne({
		guildID: interaction.guild?.id,
	});

	if (guildSettings.modules) {
		for (const moduleSetting of guildSettings.modules) {
			if (moduleSetting.module === command.module) {
				if (moduleSetting.channels) {
					for (const channelSetting of moduleSetting.channels) {
						if (
							channelSetting.channel === channel.id &&
							channelSetting.disabled
						) {
							permissible += `This command module is disabled in <#${channelSetting.channel}>.\n`;
							break;
						}
					}
				}

				if (moduleSetting.roles) {
					for (const roleSetting of moduleSetting.roles) {
						if (
							interaction.member.roles.cache.has(roleSetting.role) &&
							roleSetting?.disabled
						) {
							disabledRoles.push(`<@&${roleSetting.role}>`);
						}
					}
				}

				if (moduleSetting.disabled) {
					permissible += `This command module is disabled.\n`;
					break;
				}
			}
		}
	}

	if (guildSettings.commands) {
		for (const commandSetting of guildSettings.commands) {
			if (commandSetting.command === command.name) {
				if (commandSetting.channels) {
					for (const channelSetting of commandSetting.channels) {
						if (
							channelSetting.channel === channel.id &&
							channelSetting.disabled
						) {
							permissible += `This command is disabled in <#${channelSetting.channel}>.\n`;
							break;
						}
					}
				}

				if (commandSetting.roles) {
					for (const roleSetting of commandSetting.roles) {
						if (
							interaction.member.roles.cache.has(roleSetting.role) &&
							roleSetting.disabled
						) {
							disabledRoles.push(`<@&${roleSetting.role}>`);
						}
					}
				}

				if (commandSetting.disabled) {
					permissible += `This command is disabled.\n`;
					break;
				}
			}
		}
	}

	const clientMember = await interaction.guild?.members.cache.get(
		client.user.id
	);

	for (const permission of command.settings.permissions.userPermissions) {
		if (!interaction.member.permissionsIn(channel).has(permission)) {
			missingUserPermissions.push(`\`${permission}\``);
		}
	}

	for (const permission of command.settings.permissions.clientPermissions) {
		if (!clientMember.permissionsIn(channel).has(permission)) {
			missingClientPermissions.push(`\`${permission}\``);
		}
	}

	for (const role of command.settings.roles) {
		const guildRole = interaction.guild.roles.cache.find((r) => {
			return r.name.toLowerCase() === role.name.toLowerCase();
		});

		if (!guildRole) {
			permissible += `Please create a(n) \`${role.name}\` role. Case insensitive.\n`;
		} else if (
			role.required &&
			!interaction.member.roles.cache.has(guildRole.id)
		) {
			missingRoles.push(`<@&${guildRole.id}>`);
		}
	}

	if (
		command.settings.owner &&
		!config.botAuth.admin_id.includes(interaction.member.id)
	) {
		permissible += 'You must be an `OWNER` to run this command.\n';
	}

	if (!command.settings.enabled) {
		permissible += 'This command is disabled.\n';
	}

	if (missingClientPermissions.length) {
		permissible += `I am missing the ${missingClientPermissions.join(
			', '
		)} permission(s) to run this command.\n`;
	}

	if (missingUserPermissions.length) {
		permissible += `You are missing the ${missingUserPermissions.join(
			', '
		)} permission(s) to run this command.\n`;
	}

	if (missingRoles.length) {
		permissible += `You are missing the ${missingRoles.join(
			', '
		)} role(s) to run this command.\n`;
	}

	if (disabledRoles.length) {
		permissible += `This command is disabled for the ${disabledRoles.join(
			', '
		)} role(s).\n`;
	}

	if (permissible.length) {
		const embed = util.embedify(
			'RED',
			interaction.user.tag,
			interaction.user.displayAvatarURL(),
			permissible
		);

		interaction.reply({ embeds: [embed], ephemeral: true });
	}

	return permissible.length ? false : true;
};

const coolDown = async (interaction) => {
	if (!interaction.inGuild()) {
		return true;
	}

	const result = await guildSettingsSchema.findOne({
		guildID: interaction.guild.id,
	});

	if (!result) {
		util.initGuildSettings(interaction.guild);
	}

	properties = result.commands.find((c) => {
		return c.command === interaction.commandName;
	});

	const uProperties = await util.getUserCommandStats(
		interaction.guild.id,
		interaction.user.id,
		interaction.commandName
	);

	const { cooldown } = properties || config.commands['default'];
	const { timestamp } = uProperties;
	const now = new Date().getTime();

	if (now - timestamp < cooldown) {
		const embed = util.embedify(
			'GREY',
			interaction.member.user.tag,
			'', // interaction.member.user.displayAvatarURL(),
			`:hourglass: You need to wait ${ms(
				cooldown - (now - timestamp)
			)} before using this command again!`,
			`Cooldown: ${ms(cooldown)}`
		);

		interaction.reply({ embeds: [embed], ephemeral: true });

		return false;
	} else {
		return true;
	}
};
