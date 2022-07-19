import { PermissionFlagsBits } from 'discord.js';

import { Infraction, Member, User } from '../../entities';
import { validateTarget } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('untimeout')
		.setDescription('Untimeout a member')
		.setModule('MODERATION')
		.setFormat('untimeout <member> [reason]')
		.setExamples(['untimeout @user', 'untimeout 796906750569611294 forgiveness'])
		.setClientPermissions(['ModerateMembers'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.addUserOption((option) => option.setName('target').setDescription('Specify a target.').setRequired(true))
		.addStringOption((option) => option.setName('string').setDescription('Specify a reason.'));

	public execute = new ExecutionBuilder()
		.setExecution(async (ctx) => {
			if (!(await validateTarget(ctx))) return;
			const target = ctx.interaction.options.getMember('target');
			await User.upsert({ id: target.id }, ['id']);
			await Member.upsert({ userId: target.id, guildId: ctx.guildEntity.id }, ['userId', 'guildId']);
			const targetEntity = await Member.findOneBy({ userId: target.id, guildId: ctx.guildEntity.id });
			const reason = ctx.interaction.options.getString('reason', false) || 'No reason provided';
			await target.timeout(null, reason);
			await Infraction.update(
				{ target: { userId: targetEntity.userId, guildId: targetEntity.guildId }, type: 'TIMEOUT', active: true },
				{ active: false },
			);
			await ctx.embedify('success', 'user', `Timeout canceled for ${target}.`).send();
		});
}
