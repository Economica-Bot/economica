import { GuildMember } from 'discord.js';

import { infraction, validateTarget } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

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
		if (!(await validateTarget(ctx))) return;

		const target = ctx.interaction.options.getMember('target') as GuildMember;
		const reason = (ctx.interaction.options.getString('reason') as string) ?? 'No reason provided';
		let messagedUser = true;

		await target
			.send(`You have been kicked for \`${reason}\` from **${ctx.interaction.guild.name}**`)
			.catch(() => (messagedUser = false));
		await target.kick(reason);
		await infraction(ctx.client, ctx.interaction.guildId, target.id, ctx.interaction.user.id, 'KICK', reason);

		const content = `Kicked ${target.user.tag}${messagedUser ? '\nUser notified' : '\nCould not notify user'}`;
		return await ctx.embedify('success', 'user', content);
	};
}
