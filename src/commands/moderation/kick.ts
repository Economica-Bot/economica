import { GuildMember } from 'discord.js';

import { recordInfraction, validateTarget } from '../../lib/index.js';
import { Member, User } from '../../entities/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('kick')
		.setDescription('Give a member the boot')
		.setModule('MODERATION')
		.setFormat('kick <target> [reason]')
		.setExamples(['kick @user', 'kick @user harrassment'])
		.setClientPermissions(['KICK_MEMBERS'])
		.setAuthority('MODERATOR')
		.addUserOption((option) => option.setName('target').setDescription('Specify a target.').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('Specify a reason.').setRequired(false));

	public execute = async (ctx: Context): Promise<void> => {
		if (!(await validateTarget(ctx))) return;
		const target = ctx.interaction.options.getMember('target') as GuildMember;
		const targetEntity = await Member.findOne({ user: { id: target.id }, guild: ctx.guildEntity })
			?? await (async () => {
				const user = await User.create({ id: target.id }).save();
				return Member.create({ user, guild: ctx.guildEntity }).save();
			})();
		const reason = (ctx.interaction.options.getString('reason') as string) ?? 'No reason provided';
		await target.kick(reason);
		await ctx.embedify('success', 'user', `Kicked \`${target.user.tag}\``).send(true);
		await recordInfraction(ctx.client, ctx.guildEntity, targetEntity, ctx.memberEntity, 'KICK', reason);
	};
}
