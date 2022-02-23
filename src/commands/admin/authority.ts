import { MessageEmbed, Role } from 'discord.js';

import { removeAuthRole, setAuthRole } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { Authorities } from '../../typings/constants.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('authority')
		.setDescription('Manage the economy authority role hierarchy')
		.setModule('ADMIN')
		.setFormat('authority <view | set | reset> [...options]')
		.addSubcommand((options) => options.setName('view').setDescription('View the economy authority hierarchy'))
		.addSubcommand((options) => options
			.setName('set')
			.setDescription("Set a role's authority level")
			.setFormat('<role> <user | mod | manager | admin>')
			.setAuthority('ADMINISTRATOR')
			.addRoleOption((option) => option.setName('role').setDescription('Specify a role').setRequired(true))
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
			.setDescription('Reset role authority levels')
			.setAuthority('ADMINISTRATOR')
			.addRoleOption((option) => option.setName('role').setDescription('Specify a role')));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const { auth } = ctx.guildDocument;
			const modRoles: string[] = [];
			const managerRoles: string[] = [];
			const adminRoles: string[] = [];
			auth.forEach((r) => {
				const rAuth = r.authority;
				if (rAuth === 'MODERATOR') modRoles.push(r.roleId);
				else if (rAuth === 'MANAGER') managerRoles.push(r.roleId);
				else if (rAuth === 'ADMINISTRATOR') adminRoles.push(r.roleId);
			});
			const embed = new MessageEmbed()
				.setColor('BLURPLE')
				.setAuthor({ name: `${ctx.interaction.guild.name} Authority Hierarchy`, iconURL: ctx.interaction.guild.iconURL() })
				.setDescription("Running a server economy on your own is no easy task. Build and customize your economy team with Economica's authority utility!")
				.addField('__Economy Mod__', 'Keep your economy safe and cheater-free!')
				.addField('Description', 'Economy mods can manage the economy blacklists (economy blacklist, loans blacklist, etc...)\n', true)
				.addField('Roles', `${modRoles.length ? `<@&${modRoles.join('>, <@&')}>` : 'No Authorized Roles\n'}`, true)
				.addField('__Economy Manager__', 'Update your economy with fresh new content!')
				.addField('Description', 'Economy managers can manage the economy as a whole (shop, users, inventories, etc...). They also have all the permissions of Economy Mods.\n', true)
				.addField('Roles', `${managerRoles.length ? `<@&${managerRoles.join('>, <@&')}>` : 'No Authorized roles\n*Note: Any user with a role called `Economy Manager` (caps insensitive) is automatically considered an economy manager.\n'}`, true)
				.addField('__Economy Admin__', 'Lead your economy team!')
				.addField('Description', 'Economy Admins can do anything with regards to the economy (reset economy, manage economy ranks and permissions, etc...)\n', true)
				.addField('Roles', `${adminRoles.length ? `<@&${adminRoles.join('>, <@&')}>` : 'No Authorized Roles\n*Note: Any user with the `ADMINISTRATOR` permission is automatically considered an Economy Admin.\n'}`, true);
			await ctx.interaction.reply({ embeds: [embed] });
		} else if (subcommand === 'set') {
			const level = ctx.interaction.options.getString('authority') as keyof typeof Authorities;
			const targetRole = ctx.interaction.options.getRole('role') as Role;
			await removeAuthRole(ctx.interaction.guild, targetRole);
			await setAuthRole(ctx.interaction.guild, targetRole, level);
			await ctx.embedify('success', 'bot', `${targetRole} has been set to \`${level}\`.`, false);
		} else if (subcommand === 'reset') {
			const targetRole = ctx.interaction.options.getRole('role', false) as Role;
			if (targetRole) {
				await removeAuthRole(ctx.interaction.guild, targetRole);
				await ctx.embedify('success', 'bot', `${targetRole} has been reset.`, false);
			} else {
				ctx.guildDocument.updateOne({ auth: [] });
				await ctx.embedify('success', 'bot', 'All roles have been reset.', false);
			}
		}
	};
}
