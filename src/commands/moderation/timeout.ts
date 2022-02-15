import { GuildMember } from 'discord.js';
import ms from 'ms';

import { infraction, validateTarget } from '../../lib';
import { MemberModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('timeout')
		.setDescription('Timeout a member.')
		.setModule('MODERATION')
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

	public execute = async (ctx: Context): Promise<void> => {
		if (!(await validateTarget(ctx))) return;
		const target = ctx.interaction.options.getMember('target') as GuildMember;
		const targetDocument = await MemberModel.findOneAndUpdate(
			{ guild: ctx.guildDocument, userId: target.id },
			{ guild: ctx.guildDocument, userId: target.id },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
		const duration = ctx.interaction.options.getString('duration') as string;
		const permanent = duration === 'Permanent' ? true : false;
		const milliseconds = ms(duration);
		const formattedDuration = milliseconds ? `for ${ms(milliseconds)}` : 'permanently';
		const reason = (ctx.interaction.options.getString('reason') as string) ?? 'No reason provided';
		let messagedUser = true;

		const dmEmbed = ctx
			.embedify('warn', 'user', `You have been placed under a timeout in **${ctx.interaction.guild.name}**`)
			.addField('Duration', formattedDuration, true)
			.addField('Reason', reason, true);
		await target.send({ embeds: [dmEmbed] }).catch(() => (messagedUser = false));
		await target.timeout(milliseconds, reason);
		await infraction(
			ctx.client,
			ctx.guildDocument,
			targetDocument,
			ctx.memberDocument,
			'TIMEOUT',
			reason,
			permanent,
			true,
			milliseconds
		);

		const embed = ctx
			.embedify('success', 'user', `Placed \`${target.user.tag}\` under a timeout | Length: ${formattedDuration}`)
			.setFooter({ text: messagedUser ? 'User notified.' : 'Could not notify user.' });
		return await ctx.interaction.reply({ embeds: [embed] });
	};
}
