import { GuildMember } from 'discord.js';
import ms from 'ms';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import { infraction } from '../../lib/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('timeout')
		.setDescription('Timeout a member.')
		.setGroup('MODERATION')
		.setFormat('<member> [duration] [reason]')
		.setExamples([
			'timeout @JohnDoe',
			'timeout @Pepe 3h',
			'timeout @Wumpus Spamming',
			'timeout @YourMom420 2d Megalomania',
		])
		.setClientPermissions(['MODERATE_MEMBERS'])
		.setAuthority('MODERATOR')
		.addUserOption((option) => option.setName('target').setDescription('Specify a target.').setRequired(true))
		.addStringOption((option) => option.setName('duration').setDescription('Specify a length.').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('Specify a reason.').setRequired(false));

	execute = async (ctx: Context) => {
		const member = (await ctx.interaction.guild.members.fetch(ctx.client.user.id)) as GuildMember;
		const target = ctx.interaction.options.getMember('target') as GuildMember;
		const duration = ctx.interaction.options.getString('duration') as string;
		const milliseconds = ms(duration);
		const formattedDuration = milliseconds ? `for ${ms(milliseconds)}` : 'permanently';
		const reason = (ctx.interaction.options.getString('reason') as string) ?? 'No reason provided';
		let messagedUser = true;

		if (target.id === ctx.interaction.user.id)
			return await ctx.embedify('info', 'user', 'You cannot timeout yourself.');
		if (target.id === ctx.client.user.id) return await ctx.embedify('warn', 'user', 'You cannot timeout me!');
		if (target.roles.highest.position > member.roles.highest.position)
			return await ctx.embedify('warn', 'user', 'Insufficient permissions.');
		if (!target.moderatable) return await ctx.embedify('warn', 'user', 'Target is not moderatable.');
		if (target.communicationDisabledUntil && target.communicationDisabledUntil.getTime() > Date.now())
			return await ctx.embedify('warn', 'user', `Target is already in a timeout.`);
		if (duration !== 'Permanent' && (!milliseconds || milliseconds < 0))
			return ctx.embedify('warn', 'user', 'Invalid duration.');

		await target
			.send(
				`You have been placed under a timeout for \`${reason}\` ${formattedDuration} from **${ctx.interaction.guild.name}**`
			)
			.catch(() => (messagedUser = false));
		await target.timeout(milliseconds, reason);
		await infraction(
			ctx.client,
			ctx.interaction.guildId,
			target.id,
			ctx.interaction.user.id,
			'TIMEOUT',
			reason,
			duration === 'Permanent' ? true : false,
			true,
			milliseconds
		);

		const content = `Placed ${target} under a timeout for ${ms(milliseconds)}.${
			messagedUser ? '\nUser notified' : '\nCould not notify user'
		}`;
		return await ctx.embedify('success', 'user', content);
	};
}
