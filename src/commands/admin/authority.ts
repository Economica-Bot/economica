import { ApplicationCommandPermissionType, EmbedBuilder, GuildApplicationCommandPermissionData, Util } from 'discord.js';

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
			.addMentionableOption((option) => option.setName('mentionable').setDescription('Specify a role or user')));

	public execute = async (ctx: Context): Promise<void> => {
		const permissions = await ctx.client.application.commands.permissions.fetch({ guild: ctx.interaction.guildId });
		const commands = await ctx.client.application.commands.fetch();
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const user = permissions.filter((permission) => ctx.client.commands.get(commands.get(permission[1].id).name).data.authority === 0);
			// const user = ctx.guildEntity.auth.filter((auth) => auth.authority === 0).map((authority) => authority.toString()).join('\n');
			// const mod = ctx.guildEntity.auth.filter((auth) => auth.authority === 1).map((authority) => authority.toString()).join('\n');
			// const manager = ctx.guildEntity.auth.filter((auth) => auth.authority === 2).map((authority) => authority.toString()).join('\n');
			// const admin = ctx.guildEntity.auth.filter((auth) => auth.authority === 3).map((authority) => authority.toString()).join('\n');
			const embed = new EmbedBuilder()
				.setColor(Util.resolveColor('Blurple'))
				.setAuthor({ name: `${ctx.interaction.guild.name} Authority Hierarchy`, iconURL: ctx.interaction.guild.iconURL() })
				.setDescription("Running a server economy on your own is no easy task. Build and customize your economy team with Economica's authority utility!")
				.addFields(
					{ name: '__User__', value: 'The basic economy member' },
					{ name: 'Description', value: 'Economy users can use basic level commands\n', inline: true },
					{ name: 'Items', value: 'user' || 'No Authorized Users or Roles\n', inline: true },
					{ name: '__Moderator__', value: 'Keep your economy safe and cheater-free!' },
					{ name: 'Description', value: 'Economy mods can manage the economy blacklists (economy blacklist, loans blacklist, etc...)\n', inline: true },
					{ name: 'Items', value: 'mod' || 'No Authorized Users or Roles\n', inline: true },
					{ name: '__Manager__', value: 'Update your economy with fresh new content!' },
					{ name: 'Description', value: 'Economy managers can manage the economy as a whole (shop, users, inventories, etc...). They also have all the permissions of Economy Mods.\n', inline: true },
					{ name: 'Items', value: 'manager' || 'No Authorized Users or Roles\n*Note: Any member with the `MANAGE_GUILD` permission is automatically considered an economy manager.', inline: true },
					{ name: '__Administrator__', value: 'Lead your economy team!' },
					{ name: 'Description', value: 'Economy Admins can do anything with regards to the economy (reset economy, manage economy ranks and permissions, etc...)\n', inline: true },
					{ name: 'Items', value: 'admin' || 'No Authorized Users or Roles\n*Note: Any member with the `ADMINISTRATOR` permission is automatically considered an Economy Admin.\n', inline: true },
				);
			await ctx.interaction.reply({ embeds: [embed], ephemeral: true });
		} else if (subcommand === 'set') {
			await ctx.interaction.deferReply();
			const authority = ctx.interaction.options.getString('authority');
			const authorityLevel = Authorities[authority];
			const { id } = ctx.interaction.options.getMentionable('mentionable');
			const type = ctx.client.application.commands.cache.get(id) ? ApplicationCommandPermissionType.User : ApplicationCommandPermissionType.Role;
			const fullPermissions = commands
				.filter((command) => ctx.client.commands.get(command.name).data.authority <= authorityLevel)
				.map((command) => ({ id: command.id, permissions: [{ id, type, permission: true }] } as GuildApplicationCommandPermissionData));
			await ctx.client.application.commands.permissions.set({ guild: ctx.interaction.guildId, fullPermissions: ctx.client.application.commands.cache.map((command) => ({ id: command.id, permissions: [{ id, type, permission: false }] } as GuildApplicationCommandPermissionData)) });
			await ctx.client.application.commands.permissions.set({ guild: ctx.interaction.guildId, fullPermissions });
			await ctx.embedify('success', 'bot', `Authority set to \`${authority}\`.`).send(true);
		} else if (subcommand === 'reset') {
			const { id } = ctx.interaction.options.getMentionable('mentionable', false);
			if (id) {
				await ctx.embedify('success', 'bot', 'Authority reset.').send(true);
			} else {
				await ctx.embedify('success', 'bot', 'Authority settings have been reset.').send(true);
			}
		}
	};
}
