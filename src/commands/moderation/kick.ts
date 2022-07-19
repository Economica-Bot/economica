import { PermissionFlagsBits } from 'discord.js';

import { Member, User } from '../../entities';
import { recordInfraction, validateTarget } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

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

	public execute = new ExecutionBuilder()
		.setExecution(async (ctx) => {
			if (!(await validateTarget(ctx))) return;
			const target = ctx.interaction.options.getMember('target');
			await User.upsert({ id: target.id }, ['id']);
			await Member.upsert({ userId: target.id, guildId: ctx.guildEntity.id }, ['userId', 'guildId']);
			const targetEntity = await Member.findOneBy({ userId: target.id, guildId: ctx.guildEntity.id });
			const reason = (ctx.interaction.options.getString('reason') as string) ?? 'No reason provided';
			await target.kick(reason);
			await ctx.embedify('success', 'user', `Kicked \`${target.user.tag}\``).send(true);
			await recordInfraction(ctx.client, ctx.guildEntity, targetEntity, ctx.memberEntity, 'KICK', reason);
		});
}
