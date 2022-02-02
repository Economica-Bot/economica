import { Message, MessageEmbed, Role } from 'discord.js';

import { removeAuthRole, setAuthRole } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import { Authority } from '../../typings';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('authority')
		.setDescription('Interact with the economy authority role hierarchy.')
		.setGroup('ADMIN')
		.setFormat('<view | set | reset> [...options]')
		.addEconomicaSubcommand((options) =>
			options.setName('view').setDescription('View the economy authority hierarchy.')
		)
		.addEconomicaSubcommand((options) =>
			options
				.setName('set')
				.setDescription("Set a role's authority level")
				.setFormat('<role> <user | mod | manager | admin>')
				.setAuthority('ADMINISTRATOR')
				.addRoleOption((option) => option.setName('role').setDescription('Specify a role.').setRequired(true))
				.addStringOption((option) =>
					option
						.setName('level')
						.setDescription('The level of authority to be given to `role`')
						.addChoices([
							['User', 'USER'],
							['Moderator', 'MODERATOR'],
							['Manager', 'MANAGER'],
							['Administrator', 'ADMINISTRATOR'],
						])
						.setRequired(true)
				)
		)
		.addEconomicaSubcommand((options) =>
			options
				.setName('reset')
				.setDescription('Reset role authority levels.')
				.setAuthority('ADMINISTRATOR')
				.addRoleOption((option) => option.setName('role').setDescription('Specify a role.'))
		);

	public execute = async (ctx: Context): Promise<Message | void> => {
		const subcommand = ctx.interaction.options.getSubcommand();

		if (subcommand === 'view') {
			// Get the auth roles from db
			const { auth } = ctx.guildDocument;
			const modRoles = Array<string>();
			const managerRoles = Array<string>();
			const adminRoles = Array<string>();
			auth.forEach((r) => {
				const auth = r.authority;
				if (auth === 'MODERATOR') modRoles.push(r.roleId);
				else if (auth === 'MANAGER') managerRoles.push(r.roleId);
				else if (auth === 'ADMINISTRATOR') adminRoles.push(r.roleId);
			});

			const embed = new MessageEmbed()
				.setColor('BLURPLE')
				.setAuthor({
					name: `${ctx.interaction.guild.name} Authority Hierarchy`,
					iconURL: ctx.interaction.guild.iconURL(),
				})
				.setDescription(
					"Running a server economy on your own is no easy task. Build and customize your economy team with Economica's authority utility!"
				)
				.addField('__Economy Mod__', 'Keep your economy safe and cheater-free!')
				.addField(
					'Description',
					`Economy mods can manage the economy blacklists (economy blacklist, loans blacklist, etc...)\n`,
					true
				)
				.addField('Roles', `${modRoles.length ? `<@&${modRoles.join('>, <@&')}>` : 'No Authorized Roles\n'}`, true)
				.addField('__Economy Manager__', 'Update your economy with fresh new content!')
				.addField(
					'Description',
					`Economy managers can manage the economy as a whole (shop, users, inventories, etc...). They also have all the permissions of Economy Mods.\n`,
					true
				)
				.addField(
					'Roles',
					`${
						managerRoles.length
							? `<@&${managerRoles.join('>, <@&')}>`
							: 'No Authorized roles\n*Note: Any user with a role called `Economy Manager` (caps insensitive) is automatically considered an economy manager.\n'
					}`,
					true
				)
				.addField('__Economy Admin__', 'Lead your economy team!')
				.addField(
					'Description',
					`Economy Admins can do anything with regards to the economy (reset economy, manage economy ranks and permissions, etc...)\n`,
					true
				)
				.addField(
					'Roles',
					`${
						adminRoles.length
							? `<@&${adminRoles.join('>, <@&')}>`
							: 'No Authorized Roles\n*Note: Any user with the `ADMINISTRATOR` permission is automatically considered an Economy Admin.\n'
					}`,
					true
				);

			return await ctx.interaction.reply({ embeds: [embed] });
		} else if (subcommand === 'set') {
			const level = ctx.interaction.options.getString('level') as Authority;
			const targetRole = ctx.interaction.options.getRole('role') as Role;
			await removeAuthRole(ctx.interaction.guild, targetRole);
			await setAuthRole(ctx.interaction.guild, targetRole, level);
			return await ctx.embedify('success', 'bot', `${targetRole} has been set to \`${level}\`.`, false);
		} else if (subcommand === 'reset') {
			const targetRole = ctx.interaction.options.getRole('role', false) as Role;
			if (targetRole) {
				await removeAuthRole(ctx.interaction.guild, targetRole);
				return await ctx.embedify('success', 'bot', `${targetRole} has been reset.`, false);
			} else {
				ctx.guildDocument.updateOne({ auth: [] });
				return await ctx.embedify('success', 'bot', 'All roles have been reset.', false);
			}
		}
	};
}
