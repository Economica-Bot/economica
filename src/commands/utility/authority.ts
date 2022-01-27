import { MessageEmbed, Role } from 'discord.js';

import { Authority, Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import { removeAuthRole } from '../../util';
import { setAuthRole } from '../../util/auth';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('authority')
		.setDescription('Interact with the economy-permission roles')
		.setGroup('utility')
		.setFormat('<view | set | reset> [...options]')
		.setUserPermissions(['ADMINISTRATOR'])
		.setGlobal(false)
		.addEconomicaSubcommand((options) => options.setName('view').setDescription('View the economy authority of roles.'))
		.addEconomicaSubcommand((options) =>
			options
				.setName('set')
				.setDescription("Set a role's authority level")
				.setFormat('<role> <user | mod | manager | admin>')
				.addRoleOption((option) =>
					option.setName('role').setDescription('The target role to grant authority to.').setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName('level')
						.setDescription('The level of authority to be given to `role`')
						.addChoices([
							['User', 'user'],
							['Mod', 'mod'],
							['Economy Manager', 'manager'],
							['Admin', 'admin'],
						])
						.setRequired(true)
				)
		)
		.addEconomicaSubcommand((options) =>
			options
				.setName('reset')
				.setDescription("Reset a role's authority level.")
				.addRoleOption((option) => option.setName('role').setDescription('Specify a role.').setRequired(true))
		);
	execute = async (ctx: Context) => {
		const subcommand = ctx.interaction.options.getSubcommand();

		if (subcommand === 'view') {
			// Get the auth roles from db
			const { auth } = ctx.guildDocument;
			const modRoles = Array<string>();
			const managerRoles = Array<string>();
			const adminRoles = Array<string>();
			auth.forEach((r) => {
				const auth = r.authority;
				if (auth === 'mod') modRoles.push(r.roleId);
				else if (auth === 'manager') managerRoles.push(r.roleId);
				else if (auth === 'admin') adminRoles.push(r.roleId);
			});

			const embed = new MessageEmbed()
				.setColor('BLURPLE')
				.setAuthor({
					name: `${ctx.interaction.guild.name} Economy Authority Hierarchy`,
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
			return await ctx.embedify('success', 'bot', `${targetRole} has been set to \`${level}\`.`);
		} else if (subcommand === 'reset') {
			const targetRole = ctx.interaction.options.getRole('role') as Role;
			await removeAuthRole(ctx.interaction.guild, targetRole);
			return await ctx.embedify('success', 'bot', `${targetRole} has been reset.`);
		}
	};
}
