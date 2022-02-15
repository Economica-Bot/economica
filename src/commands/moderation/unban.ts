import { validateTarget } from '../../lib';
import { MemberModel } from '../../models';
import { InfractionModel } from '../../models/infractions';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('unban')
		.setDescription('Unban a member.')
		.setModule('MODERATION')
		.setFormat('<member>')
		.setExamples(['unban 796906750569611294'])
		.setClientPermissions(['BAN_MEMBERS'])
		.setAuthority('MODERATOR')
		.addUserOption((option) => option.setName('target').setDescription('Specify a target.').setRequired(true))
		.addStringOption((option) => option.setName('string').setDescription('Specify a reason.'));

	public execute = async (ctx: Context): Promise<void> => {
		if (!(await validateTarget(ctx))) return;
		const target = ctx.interaction.options.getUser('target');
		const targetDocument = await MemberModel.findOneAndUpdate(
			{ guild: ctx.guildDocument, userId: target.id },
			{ guild: ctx.guildDocument, userId: target.id },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
		const reason = ctx.interaction.options.getString('reason', false) || 'No reason provided';
		const ban = (await ctx.interaction.guild.bans.fetch()).get(target.id);
		if (!ban) return await ctx.embedify('error', 'user', 'Could not find banned user.', true);
		let messagedUser = true;

		const dmEmbed = ctx
			.embedify('warn', 'user', `You have been unbanned from **${ctx.interaction.guild.name}**`)
			.addField('Reason', reason, true);
		await target.send({ embeds: [dmEmbed] }).catch(() => (messagedUser = false));
		await ctx.interaction.guild.members.unban(target, reason);
		await InfractionModel.updateMany(
			{
				target: targetDocument,
				guild: ctx.guildDocument,
				type: 'BAN',
				active: true,
			},
			{
				active: false,
			}
		);

		const embed = ctx
			.embedify('success', 'user', `Unnanned \`${target.tag}\``)
			.setFooter({ text: messagedUser ? 'User notified.' : 'Could not notify user.' });
		return await ctx.interaction.reply({ embeds: [embed] });
	};
}
