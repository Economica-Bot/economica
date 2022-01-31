import { GuildMember, Message } from 'discord.js';
import ms from 'ms';

import { infraction, validateTarget } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

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

	execute = async (ctx: Context): Promise<Message> => {
		if (!(await validateTarget(ctx))) return;

		const target = ctx.interaction.options.getMember('target') as GuildMember;
		const duration = ctx.interaction.options.getString('duration') as string;
		const milliseconds = ms(duration);
		const formattedDuration = milliseconds ? `for ${ms(milliseconds)}` : 'permanently';
		const reason = (ctx.interaction.options.getString('reason') as string) ?? 'No reason provided';
		let messagedUser = true;

		if (duration !== 'Permanent' && (!milliseconds || milliseconds < 0))
			return ctx.embedify('warn', 'user', 'Invalid duration.', true);

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

		// prettier-ignore
		const content = `Placed ${target} under a timeout ${formattedDuration}.${messagedUser ? '\nUser notified' : '\nCould not notify user'}`;
		return await ctx.embedify('success', 'user', content, false);
	};
}
