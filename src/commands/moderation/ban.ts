import { PermissionFlagsBits } from 'discord.js';
import ms from 'ms';

import { Member, User } from '../../entities';
import { recordInfraction, validateTarget } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban a member')
		.setModule('MODERATION')
		.setFormat('ban <member> [duration] [reason] [days]')
		.setExamples(['ban @user', 'ban @user 3h', 'ban @user spamming', 'ban @user 3h spamming'])
		.setClientPermissions(['BanMembers'])
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addUserOption((option) => option.setName('target').setDescription('Specify a target').setRequired(true))
		.addStringOption((option) => option.setName('duration').setDescription('Specify a duration').setRequired(false))
		.addStringOption((option) => option.setName('reason').setDescription('Specify a reason').setRequired(false))
		.addNumberOption((option) => option
			.setName('days')
			.setDescription('Specify number of days of messages to delete')
			.setMinValue(0)
			.setMaxValue(7)
			.setRequired(false));

	public execution = new ExecutionNode<'top'>()
		.setName('Banning...')
		.setValue('ban')
		.setDescription((ctx) => `Banned \`${ctx.variables.target.user.tag}\` | Length: ${ctx.variables.formattedDuration}`)
		.setExecution(async (ctx) => {
			await validateTarget(ctx);
			const target = ctx.interaction.options.getMember('target');
			ctx.variables.target = target;
			await User.upsert({ id: target.id }, ['id']);
			await Member.upsert({ userId: target.id, guildId: ctx.guildEntity.id }, ['userId', 'guildId']);
			const targetEntity = await Member.findOneBy({ userId: target.id, guildId: ctx.guildEntity.id });
			const duration = ctx.interaction.options.getString('duration') ?? 'Permanent';
			const permanent = duration === 'Permanent';
			const milliseconds = ms(duration);
			const formattedDuration = milliseconds ? `**${ms(milliseconds)}**` : '**Permanent**';
			ctx.variables.formattedDuration = formattedDuration;
			const reason = ctx.interaction.options.getString('reason') ?? 'No reason provided';
			const deleteMessageDays = ctx.interaction.options.getNumber('days') ?? 0;
			await target.ban({ deleteMessageDays, reason });
			await recordInfraction(ctx.interaction.client, ctx.guildEntity, targetEntity, ctx.memberEntity, 'BAN', reason, true, milliseconds, permanent);
		});
}
