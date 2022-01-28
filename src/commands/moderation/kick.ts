import { GuildMember } from 'discord.js';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import { infraction } from '../../lib/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('kick')
		.setDescription('Kick a member.')
		.setGroup('MODERATION')
		.setFormat('<target> [reason]')
		.setExamples(['kick @JohnDoe', 'kick @Pepe Harrassment'])
		.setClientPermissions(['KICK_MEMBERS'])
		.setAuthority('MODERATOR')
		.addUserOption((option) => option.setName('target').setDescription('Specify a target.').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('Specify a reason.').setRequired(false));

	execute = async (ctx: Context) => {
		const member = (await ctx.interaction.guild.members.fetch(ctx.client.user.id)) as GuildMember;
		const target = ctx.interaction.options.getMember('target') as GuildMember;
		const reason = (ctx.interaction.options.getString('reason') as string) ?? 'No reason provided';
		let messagedUser = true;

		if (target.id === ctx.interaction.user.id) return await ctx.embedify('warn', 'user', 'You cannot kick yourself.');
		if (target.id === ctx.client.user.id) return await ctx.embedify('warn', 'user', 'You cannot kick me!');
		if (target.roles.highest.position > member.roles.highest.position)
			return await ctx.embedify('warn', 'user', "Target's roles are too high.");
		if (!target.kickable) return await ctx.embedify('warn', 'user', 'Target is unkickable.');

		await target
			.send(`You have been kicked for \`${reason}\` from **${ctx.interaction.guild.name}**`)
			.catch(() => (messagedUser = false));
		await target.kick(reason);
		await infraction(ctx.client, ctx.interaction.guildId, target.id, ctx.interaction.user.id, 'KICK', reason);

		const content = `Kicked ${target.user.tag}${messagedUser ? '\nUser notified' : '\nCould not notify user'}`;
		return await ctx.embedify('success', 'user', content);
	};
}
