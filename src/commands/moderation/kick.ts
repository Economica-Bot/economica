import { PermissionFlagsBits } from 'discord.js';

import { Member, User } from '../../entities';
import { recordInfraction, validateTarget } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('kick')
		.setDescription('Give a member the boot')
		.setModule('MODERATION')
		.setFormat('kick <target> [reason]')
		.setExamples(['kick @user', 'kick @user harrassment'])
		.setClientPermissions(['KickMembers'])
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.addUserOption((option) => option.setName('target').setDescription('Specify a target.').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('Specify a reason.').setRequired(false));

	public execution = new ExecutionNode<'top'>()
		.setName('Kick')
		.setDescription((ctx) => `Kicked \`${ctx.variables.target.user.tag}\``)
		.setValue('kick')
		.setExecution(async (ctx) => {
			await validateTarget(ctx);
			ctx.variables.target = ctx.interaction.options.getMember('target');
			await User.upsert({ id: ctx.variables.target.id }, ['id']);
			await Member.upsert({ userId: ctx.variables.target.id, guildId: ctx.guildEntity.id }, ['userId', 'guildId']);
			const targetEntity = await Member.findOneBy({ userId: ctx.variables.target.id, guildId: ctx.guildEntity.id });
			const reason = (ctx.interaction.options.getString('reason') as string) ?? 'No reason provided';
			await ctx.variables.target.kick(reason);
			await recordInfraction(ctx.interaction.client, ctx.guildEntity, targetEntity, ctx.memberEntity, 'KICK', reason);
		});
}
