import { GuildMember, MessageEmbed } from 'discord.js';
import ms from 'ms';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import { infraction } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban a member.')
		.setGroup('moderation')
		.setFormat('<member> [length] [reason]')
		.setExamples(['ban @JohnDoe', 'ban @Pepe 3h', 'ban @Wumpus Spamming', 'ban @YourMom420 2d Megalomania'])
		.setGlobal(false)
		.setUserPermissions(['BAN_MEMBERS'])
		.setClientPermissions(['BAN_MEMBERS'])
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
		const member = (await ctx.interaction.guild.members.fetch(ctx.client.user.id)) as GuildMember;
		const target = ctx.interaction.options.getMember('target') as GuildMember;
		const duration = ctx.interaction.options.getString('length') ?? 'Permanent';
		const milliseconds = ms(duration);
		const formattedDuration = milliseconds ? `for ${ms(milliseconds)}` : 'permanently';
		const reason = ctx.interaction.options.getString('reason') ?? 'No reason provided';
		const days = ctx.interaction.options.getNumber('days') ?? 0;
		let messagedUser = true;

		if (target.id === ctx.interaction.user.id) return await ctx.embedify('warn', 'user', 'You cannot ban yourself.');
		if (target.id === ctx.client.user.id) return await ctx.embedify('warn', 'user', 'You cannot ban me!');
		if (target.roles.highest.position > member.roles.highest.position) return await ctx.embedify('warn', 'user', "Target's roles are too high.");
		if (!target.bannable) return await ctx.embedify('warn', 'user', 'Target is unbannable.');
		if (duration !== 'Permanent' && (!milliseconds || milliseconds < 0)) return ctx.embedify('warn', 'user', 'Invalid duration.');
		
		await target
			.send(`You have been banned for \`${reason}\` ${formattedDuration} from **${ctx.interaction.guild.name}**`)
			.catch(() =>  messagedUser = false );
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

		const content = `Banned ${target.user.tag} ${formattedDuration}.${messagedUser ? '\nUser notified' : '\nCould not notify user'}`
		return await ctx.embedify('success', 'user', content);
	};
}
