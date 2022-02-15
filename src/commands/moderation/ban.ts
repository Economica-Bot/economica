import { GuildMember } from 'discord.js';
import ms from 'ms';

import { infraction, validateTarget } from '../../lib';
import { MemberModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban a member.')
		.setModule('MODERATION')
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

	public execute = async (ctx: Context): Promise<void> => {
		if (!(await validateTarget(ctx))) return;
		const target = ctx.interaction.options.getMember('target') as GuildMember;
		const targetDocument = await MemberModel.findOneAndUpdate(
			{ guild: ctx.guildDocument, userId: target.id },
			{ guild: ctx.guildDocument, userId: target.id },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
		const duration = ctx.interaction.options.getString('duration') ?? 'Permanent';
		const permanent = duration === 'Permanent' ? true : false;
		const milliseconds = ms(duration);
		const formattedDuration = milliseconds ? `**${ms(milliseconds)}**` : '**Permanent**';
		const reason = ctx.interaction.options.getString('reason') ?? 'No reason provided';
		const days = ctx.interaction.options.getNumber('days') ?? 0;
		let messagedUser = true;

		const dmEmbed = ctx
			.embedify('warn', 'user', `You have been banned from **${ctx.interaction.guild.name}**`)
			.addField('Duration', formattedDuration, true)
			.addField('Reason', reason, true);
		await target.send({ embeds: [dmEmbed] }).catch(() => (messagedUser = false));
		await target.ban({ days, reason });
		await infraction(
			ctx.client,
			ctx.guildDocument,
			targetDocument,
			ctx.memberDocument,
			'BAN',
			reason,
			permanent,
			true,
			milliseconds
		);

		const embed = ctx
			.embedify('success', 'user', `Banned \`${target.user.tag}\` | Length: ${formattedDuration}`)
			.setFooter({ text: messagedUser ? 'User notified.' : 'Could not notify user.' });
		return await ctx.interaction.reply({ embeds: [embed] });
	};
}
