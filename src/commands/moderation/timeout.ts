import { GuildMember, PermissionFlagsBits } from 'discord.js';
import ms from 'ms';

import { Member, User } from '../../entities/index.js';
import { recordInfraction, validateTarget } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures/index.js';

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
		.setClientPermissions(['ModerateMembers'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.addUserOption((option) => option.setName('target').setDescription('Specify a target').setRequired(true))
		.addStringOption((option) => option.setName('duration').setDescription('Specify a duration').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('Specify a reason').setRequired(false));

	public execute = new ExecutionBuilder()
		.setExecution(async (ctx: Context): Promise<void> => {
			if (!(await validateTarget(ctx))) return;
			const target = ctx.interaction.options.getMember('target') as GuildMember;
			const targetEntity = await Member.findOne({ where: { userId: target.id, guildId: ctx.guildEntity.id } })
				?? await (async () => {
					const user = await User.create({ id: target.id }).save();
					return Member.create({ user, guild: ctx.guildEntity }).save();
				})();
			const duration = ctx.interaction.options.getString('duration') as string;
			const milliseconds = ms(duration);
			if (milliseconds > 1000 * 60 * 60 * 24 * 28) {
				await ctx.embedify('error', 'user', 'Timeout cannot exceed 28 days.').send(true);
				return;
			}
			const reason = (ctx.interaction.options.getString('reason') as string) ?? 'No reason provided';
			await target.timeout(milliseconds, reason);
			await ctx.embedify('success', 'user', `Placed \`${target.user.tag}\` under a timeout for ${ms(milliseconds)}.`).send();
			await recordInfraction(ctx.client, ctx.guildEntity, targetEntity, ctx.memberEntity, 'TIMEOUT', reason, true, milliseconds, false);
		});
}
