import { MessageEmbed, Role } from 'discord.js';

import { removeAuth, setAuth } from '../../lib/index.js';
import { Authority } from '../../models/index.js';
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
			.setDescription('Reset role authority levels')
			.setAuthority('ADMINISTRATOR')
			.addRoleOption((option) => option.setName('role').setDescription('Specify a role')));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const mod: string[] = [];
			const manager: string[] = [];
			const admin: string[] = [];
			ctx.guildDocument.auth.forEach(({ type, id, authority }: Authority) => {
				if (authority === 'MODERATOR') {
					if (type === 'Role') mod.push(`<@&${id}>`);
					else mod.push(`<@!${id}>`);
				} else if (authority === 'MANAGER') {
					if (type === 'Role') manager.push(`<@&${id}>`);
					else manager.push(`<@!${id}>`);
				} else if (authority === 'ADMINISTRATOR') {
					if (type === 'Role') admin.push(`<@&${id}>`);
					else admin.push(`<@!${id}>`);
				}
			});
			const embed = new MessageEmbed()
				.setColor('BLURPLE')
				.setAuthor({ name: `${ctx.interaction.guild.name} Authority Hierarchy`, iconURL: ctx.interaction.guild.iconURL() })
				.setDescription("Running a server economy on your own is no easy task. Build and customize your economy team with Economica's authority utility!")
				.addField('__Economy Mod__', 'Keep your economy safe and cheater-free!')
				.addField('Description', 'Economy mods can manage the economy blacklists (economy blacklist, loans blacklist, etc...)\n', true)
				.addField('Roles', `${mod.length ? `${mod.join(', ')}` : 'No Authorized Roles\n'}`, true)
				.addField('__Economy Manager__', 'Update your economy with fresh new content!')
				.addField('Description', 'Economy managers can manage the economy as a whole (shop, users, inventories, etc...). They also have all the permissions of Economy Mods.\n', true)
				.addField('Roles', `${manager.length ? `${manager.join(', ')}` : 'No Authorized roles\n*Note: Any user with a role called `Economy Manager` (caps insensitive) is automatically considered an economy manager.\n'}`, true)
				.addField('__Economy Admin__', 'Lead your economy team!')
				.addField('Description', 'Economy Admins can do anything with regards to the economy (reset economy, manage economy ranks and permissions, etc...)\n', true)
				.addField('Roles', `${admin.length ? `${admin.join(', ')}` : 'No Authorized Roles\n*Note: Any user with the `ADMINISTRATOR` permission is automatically considered an Economy Admin.\n'}`, true);
			await ctx.interaction.reply({ embeds: [embed] });
		} else if (subcommand === 'set') {
			const level = ctx.interaction.options.getString('authority') as keyof typeof Authorities;
			const target = ctx.interaction.options.getMentionable('mentionable');
			await removeAuth(ctx.interaction.guild, target);
			await setAuth(ctx.interaction.guild, target, level);
			await ctx.embedify('success', 'bot', `${target} has been set to \`${level}\`.`, false);
		} else if (subcommand === 'reset') {
			const targetRole = ctx.interaction.options.getRole('role', false) as Role;
			if (targetRole) {
				await removeAuth(ctx.interaction.guild, targetRole);
				await ctx.embedify('success', 'bot', `${targetRole} has been reset.`, false);
			} else {
				await ctx.guildDocument.updateOne({ auth: [] });
				await ctx.embedify('success', 'bot', 'All roles have been reset.', false);
			}
		}
	};
}
