import { GuildMember } from 'discord.js';

import { validateTarget } from '../../lib';
import { MemberModel } from '../../models';
import { InfractionModel } from '../../models/infractions';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('untimeout')
		.setDescription('Untimeout a member.')
		.setModule('MODERATION')
		.setFormat('<member>')
		.setExamples(['untimeout @JohnDoe'])
		.setClientPermissions(['MODERATE_MEMBERS'])
		.setAuthority('MODERATOR')
		.addUserOption((option) => option.setName('target').setDescription('Specify a target.').setRequired(true))
		.addStringOption((option) => option.setName('string').setDescription('Specify a reason.'));

	public execute = async (ctx: Context): Promise<void> => {
		if (!(await validateTarget(ctx))) return;
		const target = ctx.interaction.options.getMember('target') as GuildMember;
		await MemberModel.findOneAndUpdate(
			{ guild: ctx.guildDocument, userId: target.id },
			{ guild: ctx.guildDocument, userId: target.id },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
		const reason = ctx.interaction.options.getString('reason', false) || 'No reason provided';
		const timeout = target.isCommunicationDisabled();
		if (!timeout) return await ctx.embedify('error', 'user', 'That user is not under a timeout.', true);
		let messagedUser = true;

		await target
			.send(`Your timeout has been canceled in **${ctx.interaction.guild.name}**`)
			.catch(() => (messagedUser = false));
		await target.timeout(null, reason);
		await InfractionModel.updateMany(
			{
				userId: target.id,
				guildId: ctx.interaction.guild.id,
				type: 'UNTIMEOUT',
				active: true,
			},
			{
				active: false,
			}
		);

		// prettier-ignore
		const content = `Timeout canceled for ${target.user.tag}${messagedUser ? '\nUser notified' : '\nCould not notify user'}`;
		return await ctx.embedify('success', 'user', content, false);
	};
}
