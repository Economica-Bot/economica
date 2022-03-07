import { validateTarget } from '../../lib/index.js';
import { Infraction, Member, User } from '../../entities/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('unban')
		.setDescription('Unban a user')
		.setModule('MODERATION')
		.setFormat('<user> [reason]')
		.setExamples(['unban @user', 'unban 796906750569611294 forgiveness'])
		.setClientPermissions(['BAN_MEMBERS'])
		.setAuthority('MODERATOR')
		.addUserOption((option) => option.setName('target').setDescription('Specify a target').setRequired(true))
		.addStringOption((option) => option.setName('string').setDescription('Specify a reason'));

	public execute = async (ctx: Context): Promise<void> => {
		if (!(await validateTarget(ctx, false))) return;
		const target = ctx.interaction.options.getUser('target');
		const targetEntity = await Member.findOne({ user: { id: target.id }, guild: ctx.guildEntity })
			?? await (async () => {
				const user = await User.create({ id: target.id }).save();
				return Member.create({ user, guild: ctx.guildEntity }).save();
			})();
		const reason = ctx.interaction.options.getString('reason', false) || 'No reason provided';
		const ban = (await ctx.interaction.guild.bans.fetch()).get(target.id);
		if (!ban) {
			await ctx.embedify('error', 'user', 'Could not find banned user.', true);
		} else {
			await ctx.interaction.guild.members.unban(target, reason);
			await Infraction.update(
				{ target: targetEntity, guild: ctx.guildEntity, type: 'BAN', active: true },
				{ active: false },
			);
			await ctx.embedify('success', 'user', `Unbanned \`${target.tag}\``, true);
		}
	};
}
