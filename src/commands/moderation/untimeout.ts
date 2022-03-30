import { GuildMember } from 'discord.js';

import { Infraction, Member, User } from '../../entities/index.js';
import { validateTarget } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('untimeout')
		.setDescription('Untimeout a member')
		.setModule('MODERATION')
		.setFormat('untimeout <member> [reason]')
		.setExamples(['untimeout @user', 'untimeout 796906750569611294 forgiveness'])
		.setClientPermissions(['ModerateMembers'])
		.setAuthority('MODERATOR')
		.setDefaultPermission(false)
		.addUserOption((option) => option.setName('target').setDescription('Specify a target.').setRequired(true))
		.addStringOption((option) => option.setName('string').setDescription('Specify a reason.'));

	public execute = async (ctx: Context): Promise<void> => {
		if (!(await validateTarget(ctx))) return;
		const target = ctx.interaction.options.getMember('target') as GuildMember;
		const targetEntity = await Member.findOne({ where: { userId: target.id, guildId: ctx.guildEntity.id } })
			?? await (async () => {
				const user = await User.create({ id: target.id }).save();
				return Member.create({ user, guild: ctx.guildEntity }).save();
			})();
		const reason = ctx.interaction.options.getString('reason', false) || 'No reason provided';
		await target.timeout(null, reason);
		await Infraction.update(
			{ target: { userId: targetEntity.userId, guildId: targetEntity.guildId }, type: 'TIMEOUT', active: true },
			{ active: false },
		);
		await ctx.embedify('success', 'user', `Timeout canceled for ${target}.`).send();
	};
}
