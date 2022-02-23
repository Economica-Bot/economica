import { GuildMember } from 'discord.js';

import { validateTarget } from '../../lib/index.js';
import { InfractionModel, MemberModel } from '../../models/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('untimeout')
		.setDescription('Untimeout a member')
		.setModule('MODERATION')
		.setFormat('untimeout <member> [reason]')
		.setExamples(['untimeout @user', 'untimeout 796906750569611294 forgiveness'])
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
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);
		const reason = ctx.interaction.options.getString('reason', false) || 'No reason provided';
		if (!target.isCommunicationDisabled()) {
			await ctx.embedify('error', 'user', 'That user is not under a timeout.', true);
		} else {
			await target.timeout(null, reason);
			await InfractionModel.updateMany(
				{ userId: target.id, guildId: ctx.interaction.guild.id, type: 'UNTIMEOUT', active: true },
				{ active: false },
			);
			const content = `Timeout canceled for ${target.user.tag}`;
			ctx.embedify('success', 'user', content, false);
		}
	};
}
