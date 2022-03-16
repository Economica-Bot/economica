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
			.setDescription("Set a role or user's authority level")
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
			const mod = ctx.guildEntity.auth.filter((auth) => auth.authority === 'MODERATOR').map((authority) => authority.toString()).join('\n');
			const manager = ctx.guildEntity.auth.filter((auth) => auth.authority === 'MANAGER').map((authority) => authority.toString()).join('\n');
			const admin = ctx.guildEntity.auth.filter((auth) => auth.authority === 'ADMINISTRATOR').map((authority) => authority.toString()).join('\n');
			const embed = new MessageEmbed()
				.setColor('BLURPLE')
				.setAuthor({ name: `${ctx.interaction.guild.name} Authority Hierarchy`, iconURL: ctx.interaction.guild.iconURL() })
				.setDescription("Running a server economy on your own is no easy task. Build and customize your economy team with Economica's authority utility!")
				.addField('__Economy Mod__', 'Keep your economy safe and cheater-free!')
				.addField('Description', 'Economy mods can manage the economy blacklists (economy blacklist, loans blacklist, etc...)\n', true)
				.addField('Items', mod || 'No Authorized Users or Roles\n', true)
				.addField('__Economy Manager__', 'Update your economy with fresh new content!')
				.addField('Description', 'Economy managers can manage the economy as a whole (shop, users, inventories, etc...). They also have all the permissions of Economy Mods.\n', true)
				.addField('Items', manager || 'No Authorized Users or Roles\n*Note: Any member with the `MANAGE_GUILD` permission is automatically considered an economy manager.', true)
				.addField('__Economy Admin__', 'Lead your economy team!')
				.addField('Description', 'Economy Admins can do anything with regards to the economy (reset economy, manage economy ranks and permissions, etc...)\n', true)
				.addField('Items', admin || 'No Authorized Users or Roles\n*Note: Any member with the `ADMINISTRATOR` permission is automatically considered an Economy Admin.\n', true);
			await ctx.interaction.reply({ embeds: [embed] });
		} else if (subcommand === 'set') {
			const authorityLevel = ctx.interaction.options.getString('authority') as keyof typeof Authorities;
			const { id } = ctx.interaction.options.getMentionable('mentionable');
			const type = ctx.client.users.cache.get(id) ? 'USER' : 'ROLE';
			if (await Authority.findOne({ id })) await Authority.update({ id }, { authority: authorityLevel });
			else await Authority.create({ id, guild: ctx.guildEntity, type, authority: authorityLevel }).save();
			await ctx.embedify('success', 'bot', `Authority set to \`${authorityLevel}\`.`).send();
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
