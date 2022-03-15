import { MessageEmbed } from 'discord.js';

import { Authority } from '../../entities';
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
		.addSubcommand((options) => options.setName('view').setDescription('View the economy authority hierarchy'))
		.addSubcommand((options) => options
			.setName('set')
			.setDescription("Set a role's authority level")
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
			.setDescription('Reset authority levels')
			.setAuthority('ADMINISTRATOR')
			.addMentionableOption((option) => option.setName('mentionable').setDescription('Specify a role or user')));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const mod: string[] = [];
			const manager: string[] = [];
			const admin: string[] = [];
			const auth = await ctx.guildEntity.auth;
			auth.forEach(({ id, type, authority }: Authority) => {
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
			const authority = ctx.interaction.options.getString('authority') as keyof typeof Authorities;
			const { id } = ctx.interaction.options.getMentionable('mentionable');
			await Authority.update({ id }, { authority });
			await ctx.embedify('success', 'bot', `Authority set to \`${authority}\`.`).send();
		} else if (subcommand === 'reset') {
			const { id } = ctx.interaction.options.getMentionable('mentionable', false);
			if (id) {
				await Authority.delete({ id });
				await ctx.embedify('success', 'bot', 'Authority reset.').send();
			} else {
				await Authority.delete({ guild: ctx.guildEntity });
				await ctx.embedify('success', 'bot', 'Authority settings have been reset.').send();
			}
		}
	};
}
