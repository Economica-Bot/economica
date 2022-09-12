import { PermissionFlagsBits } from 'discord.js';

import { Infraction } from '../../entities';
import { validateTarget } from '../../lib';
import { Command, CommandError, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('unban')
		.setDescription('Unban a user')
		.setModule('MODERATION')
		.setFormat('<user> [reason]')
		.setExamples(['unban @user', 'unban 796906750569611294 forgiveness'])
		.setClientPermissions(['BanMembers'])
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addUserOption((option) => option.setName('target').setDescription('Specify a target').setRequired(true))
		.addStringOption((option) => option.setName('string').setDescription('Specify a reason'));

	public execution = new Router()
		.get('', async (ctx) => {
			await validateTarget(ctx, false);
			const target = ctx.interaction.options.getMember('target');
			const reason = ctx.interaction.options.getString('reason', false) || 'No reason provided';
			const ban = (await ctx.interaction.guild.bans.fetch()).get(target.id);
			if (!ban) throw new CommandError('Could not find banned user.');
			await ctx.interaction.guild.members.unban(target, reason);
			await Infraction.update(
				{ target: { userId: target.id, guildId: target.guild.id }, type: 'BAN', active: true },
				{ active: false },
			);
			return new ExecutionNode()
				.setName('Unbanning...')
				.setDescription(`${Emojis.CHECK} Unbanned ${target}`);
		});
}