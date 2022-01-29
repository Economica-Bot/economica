import { GuildMember } from 'discord.js';
import ms from 'ms';

import { infraction, validateTarget } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban a member.')
		.setGroup('MODERATION')
		.setFormat('<member> [length] [reason]')
		.setExamples(['ban @JohnDoe', 'ban @Pepe 3h', 'ban @Wumpus Spamming', 'ban @YourMom420 2d Megalomania'])
		.setClientPermissions(['BAN_MEMBERS'])
		.setAuthority('MODERATOR')
		.addUserOption((option) => option.setName('target').setDescription('Specify a target.').setRequired(true))
		.addStringOption((option) => option.setName('duration').setDescription('Specify a duration.').setRequired(false))
		.addStringOption((option) => option.setName('reason').setDescription('Specify a reason.').setRequired(false))
		.addNumberOption((option) =>
			option
				.setName('days')
				.setDescription('Specify number of days of messages to delete.')
				.setMinValue(0)
				.setMaxValue(7)
				.setRequired(false)
		);

	execute = async (ctx: Context) => {
		if (!(await validateTarget(ctx))) return;

		const target = ctx.interaction.options.getMember('target') as GuildMember;
		const duration = ctx.interaction.options.getString('duration') ?? 'Permanent';
		const milliseconds = ms(duration);
		const formattedDuration = milliseconds ? `for ${ms(milliseconds)}` : 'permanently';
		const reason = ctx.interaction.options.getString('reason') ?? 'No reason provided';
		const days = ctx.interaction.options.getNumber('days') ?? 0;
		let messagedUser = true;

		await target
			.send(`You have been banned for \`${reason}\` ${formattedDuration} from **${ctx.interaction.guild.name}**`)
			.catch(() => (messagedUser = false));
		await target.ban({ days, reason });
		await infraction(
			ctx.client,
			ctx.interaction.guildId,
			target.id,
			ctx.interaction.user.id,
			'BAN',
			reason,
			duration === 'Permanent' ? true : false,
			true,
			milliseconds
		);

		const content = `Banned ${target.user.tag} ${formattedDuration}.${
			messagedUser ? '\nUser notified' : '\nCould not notify user'
		}`;
		return await ctx.embedify('success', 'user', content);
	};
}
