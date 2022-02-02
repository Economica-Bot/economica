import { GuildMember, Message } from 'discord.js';

import { validateTarget } from '../../lib';
import { InfractionModel } from '../../models/infractions';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('untimeout')
		.setDescription('Untimeout a member.')
		.setGroup('MODERATION')
		.setFormat('<member>')
		.setExamples(['untimeout @JohnDoe'])
		.setClientPermissions(['MODERATE_MEMBERS'])
		.setAuthority('MODERATOR')
		.addUserOption((option) => option.setName('target').setDescription('Specify a target.').setRequired(true));

	public execute = async (ctx: Context): Promise<Message> => {
		if (!(await validateTarget(ctx))) return;

		const target = ctx.interaction.options.getMember('target') as GuildMember;
		let messagedUser = true;

		await target
			.send(`Your timeout has been canceled in **${ctx.interaction.guild.name}**`)
			.catch(() => (messagedUser = false));
		await target.timeout(null);
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
