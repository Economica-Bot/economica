import { PermissionFlagsBits } from 'discord.js';

import { Member, User } from '../../entities';
import { recordInfraction, validateTarget } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('kick')
		.setDescription('Give a member the boot')
		.setModule('MODERATION')
		.setFormat('kick <target> [reason]')
		.setExamples(['kick @user', 'kick @user harrassment'])
		.setClientPermissions(['KickMembers'])
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.addUserOption((option) => option.setName('target').setDescription('Specify a target.').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('Specify a reason.').setRequired(false));

	public execution = new Router()
		.get('', async (ctx) => {
			await validateTarget(ctx);
			const target = ctx.interaction.options.getMember('target');
			await User.upsert({ id: target.id }, ['id']);
			await Member.upsert({ userId: target.id, guildId: ctx.guildEntity.id }, ['userId', 'guildId']);
			const targetEntity = await Member.findOneBy({ userId: target.id, guildId: ctx.guildEntity.id });
			const reason = (ctx.interaction.options.getString('reason') as string) ?? 'No reason provided';
			await target.kick(reason);
			await recordInfraction(ctx.interaction.client, ctx.guildEntity, targetEntity, ctx.memberEntity, 'KICK', reason);
			return new ExecutionNode()
				.setName('Kicking...')
				.setDescription(`${Emojis.CHECK} Kicked ${target}`);
		});
}
