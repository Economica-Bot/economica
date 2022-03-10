import { GuildMember } from 'discord.js';
import ms from 'ms';

import { recordInfraction, validateTarget } from '../../lib/index.js';
import { Member, User } from '../../entities/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban a member')
		.setModule('MODERATION')
		.setFormat('ban <member> [duration] [reason] [days]')
		.setExamples(['ban @user', 'ban @user 3h', 'ban @user spamming', 'ban @user 3h spamming'])
		.setClientPermissions(['BAN_MEMBERS'])
		.setAuthority('MODERATOR')
		.addUserOption((option) => option.setName('target').setDescription('Specify a target').setRequired(true))
		.addStringOption((option) => option.setName('duration').setDescription('Specify a duration').setRequired(false))
		.addStringOption((option) => option.setName('reason').setDescription('Specify a reason').setRequired(false))
		.addNumberOption((option) => option
			.setName('days')
			.setDescription('Specify number of days of messages to delete')
			.setMinValue(0)
			.setMaxValue(7)
			.setRequired(false));

	public execute = async (ctx: Context): Promise<void> => {
		if (!(await validateTarget(ctx))) return;
		const target = ctx.interaction.options.getMember('target') as GuildMember;
		const targetEntity = await Member.findOne({ user: { id: target.id }, guild: ctx.guildEntity })
			?? await (async () => {
				const user = await User.create({ id: target.id }).save();
				return Member.create({ user, guild: ctx.guildEntity }).save();
			})();
		const duration = ctx.interaction.options.getString('duration') ?? 'Permanent';
		const permanent = duration === 'Permanent';
		const milliseconds = ms(duration);
		const formattedDuration = milliseconds ? `**${ms(milliseconds)}**` : '**Permanent**';
		const reason = ctx.interaction.options.getString('reason') ?? 'No reason provided';
		const days = ctx.interaction.options.getNumber('days') ?? 0;
		await target.ban({ days, reason });
		await ctx.embedify('success', 'user', `Banned \`${target.user.tag}\` | Length: ${formattedDuration}`, true);
		await recordInfraction(ctx.client, ctx.guildEntity, targetEntity, ctx.memberEntity, 'BAN', reason, true, milliseconds, permanent);
	};
}
