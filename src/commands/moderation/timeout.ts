import { GuildMember } from 'discord.js';
import ms from 'ms';

import { infraction, validateTarget } from '../../lib/index.js';
import { MemberModel } from '../../models/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('timeout')
		.setDescription('Send a member to the quiet corner')
		.setModule('MODERATION')
		.setFormat('timeout <member> [duration] [reason]')
		.setExamples([
			'timeout @user',
			'timeout @user 3h',
			'timeout @user spamming',
			'timeout @user 3h spamming',
		])
		.setClientPermissions(['MODERATE_MEMBERS'])
		.setAuthority('MODERATOR')
		.addUserOption((option) => option.setName('target').setDescription('Specify a target').setRequired(true))
		.addStringOption((option) => option.setName('duration').setDescription('Specify a duration').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('Specify a reason').setRequired(false));

	public execute = async (ctx: Context): Promise<void> => {
		if (!(await validateTarget(ctx))) return;
		const target = ctx.interaction.options.getMember('target') as GuildMember;
		const targetDocument = await MemberModel.findOneAndUpdate(
			{ guild: ctx.guildDocument, userId: target.id },
			{ guild: ctx.guildDocument, userId: target.id },
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);
		const duration = ctx.interaction.options.getString('duration') as string;
		const permanent = duration === 'Permanent';
		const milliseconds = ms(duration);
		const formattedDuration = milliseconds ? `for ${ms(milliseconds)}` : 'permanently';
		const reason = (ctx.interaction.options.getString('reason') as string) ?? 'No reason provided';
		await target.timeout(milliseconds, reason);
		await infraction(ctx.client, ctx.guildDocument, targetDocument, ctx.memberDocument, 'TIMEOUT', reason, permanent, true, milliseconds);
		ctx.embedify('success', 'user', `Placed \`${target.user.tag}\` under a timeout | Length: ${formattedDuration}`, true);
	};
}
