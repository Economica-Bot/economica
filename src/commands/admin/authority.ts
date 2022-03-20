import { ApplicationCommandPermissionData, ApplicationCommandPermissionType, Collection, GuildApplicationCommandPermissionData } from 'discord.js';

import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { Authorities } from '../../typings/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('authority')
		.setDescription('Manage the economy authority role hierarchy')
		.setModule('ADMIN')
		.setFormat('authority <view | set | reset> [...options]')
		.setExamples([
			'authority view',
			'authority set @Administrator Administrator',
			'authority set @Adrastopoulos Manager',
			'authority reset',
			'authority reset @Moderator',
		])
		.setAuthority('ADMINISTRATOR')
		.setDefaultPermission(false)
		.addSubcommand((options) => options.setName('view').setDescription('View the economy authority hierarchy'))
		.addSubcommand((options) => options
			.setName('set')
			.setDescription("Set a role or user's authority level")
			.addMentionableOption((option) => option.setName('mentionable').setDescription('Specify a role or user').setRequired(true))
			.addStringOption((option) => option
				.setName('authority')
				.setDescription('Specify the authority')
				.addChoices([
					['User', 'USER'],
					['Moderator', 'MODERATOR'],
					['Manager', 'MANAGER'],
					['Administrator', 'ADMINISTRATOR'],
				])
				.setRequired(true)))
		.addSubcommand((options) => options
			.setName('reset')
			.setDescription('Reset authority levels')
			.addMentionableOption((option) => option.setName('mentionable').setDescription('Specify a role or user').setRequired(true)));

	public execute = async (ctx: Context): Promise<void> => {
		await ctx.interaction.deferReply({ ephemeral: true });
		const applicationPermissions = await ctx.client.application.commands.permissions.fetch({ guild: ctx.interaction.guildId });
		const guildApplicationCommands = await ctx.interaction.guild.commands.fetch();
		const globalApplicationCommands = await ctx.client.application.commands.fetch();
		const applicationCommands = new Collection([...guildApplicationCommands, ...globalApplicationCommands]);
		const subcommand = ctx.interaction.options.getSubcommand();
		const id = ctx.interaction.options.getMentionable('mentionable', false)?.id;
		if (subcommand === 'view') {
			const authorities = new Collection<string, Authorities>();
			applicationPermissions
				.forEach((value, key) => {
					const { authority } = ctx.client.commands.get(applicationCommands.get(key).name).data;
					value.forEach((permission) => {
						const formattedPermission = permission.type === 2 ? `<@${permission.id}>` : `<@&${permission.id}>`;
						if (!permission.permission || (authorities.has(formattedPermission) && authorities.get(formattedPermission) > authority)) return;
						authorities.set(formattedPermission, authority);
					});
				});
			ctx
				.embedify('info', 'bot', "Running a server economy on your own is no easy task. Build and customize your economy team with Economica's authority utility!")
				.setAuthor({ name: `${ctx.interaction.guild.name} Authority Hierarchy`, iconURL: ctx.interaction.guild.iconURL() })
				.addFields(
					{ name: 'User', value: 'The basic economy member, can use basic level commands.' },
					{ name: 'Items', value: Array.from(authorities.filter((auth) => auth === 0).keys()).join(', ') || 'No Authorized Users or Roles\n', inline: true },
					{ name: 'Moderator', value: 'Keep your economy safe and cheater-free! Mods can manage the economy blacklists and have basic moderation capabilities.' },
					{ name: 'Items', value: Array.from(authorities.filter((auth) => auth === 1).keys()).join(', ') || 'No Authorized Users or Roles\n', inline: true },
					{ name: 'Manager', value: 'Update your economy with fresh new content! Managers can manage the economy as a whole. They also have all the permissions of moderators.' },
					{ name: 'Items', value: Array.from(authorities.filter((auth) => auth === 2).keys()).join(', ') || 'No Authorized Users or Roles\n*Note: Any member with the `MANAGE_GUILD` permission is automatically considered an economy manager.', inline: true },
					{ name: 'Administrator', value: 'Lead your economy team! Admins can do anything in regards to the economy.' },
					{ name: 'Items', value: Array.from(authorities.filter((auth) => auth === 3).keys()).join(', ') || 'No Authorized Users or Roles\n*Note: Any member with the `ADMINISTRATOR` permission is automatically considered an Economy Admin.\n', inline: true },
				).send(true);
		} else if (subcommand === 'set') {
			const type = ctx.client.users.cache.get(id) ? ApplicationCommandPermissionType.User : ApplicationCommandPermissionType.Role;
			const authority = ctx.interaction.options.getString('authority');
			const authorityLevel = Authorities[authority];
			const fullPermissions: GuildApplicationCommandPermissionData[] = [];
			applicationCommands.forEach((applicationCommand) => {
				const permissions: ApplicationCommandPermissionData[] = applicationPermissions.get(applicationCommand.id) || [];
				const permissionData: ApplicationCommandPermissionData = { id, type, permission: ctx.client.commands.get(applicationCommand.name).data.authority <= authorityLevel };
				if (permissions.some((perm) => perm.id === id)) permissions[permissions.findIndex((perm) => perm.id === id)] = permissionData;
				else permissions.push(permissionData);
				fullPermissions.push({ id: applicationCommand.id, permissions });
			});
			await ctx.client.application.commands.permissions.set({ guild: ctx.interaction.guildId, fullPermissions });
			await ctx.embedify('success', 'bot', `Authority set to \`${authority}\`.`).send(true);
		} else if (subcommand === 'reset') {
			const fullPermissions: GuildApplicationCommandPermissionData[] = [];
			applicationPermissions.forEach((permission, command) => fullPermissions.push({ id: command, permissions: permission.filter((perm) => perm.id !== id) }));
			await ctx.client.application.commands.permissions.set({ guild: ctx.interaction.guildId, fullPermissions });
			await ctx.embedify('success', 'bot', 'Authority reset.').send(true);
		}
	};
}
