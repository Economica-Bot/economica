import { GuildMember } from 'discord.js';

import { InfractionModel } from '../../models/infractions';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('untimeout')
		.setDescription('Untimeout a member.')
		.setGroup('moderation')
		.setFormat('<member>')
		.setExamples(['untimeout @JohnDoe'])
		.setGlobal(false)
		.setUserPermissions(['MODERATE_MEMBERS'])
		.setClientPermissions(['MODERATE_MEMBERS'])
		.addUserOption((option) => option.setName('target').setDescription('Specify a target.').setRequired(true));

	execute = async (ctx: Context) => {
		const member = (await ctx.interaction.guild.members.fetch(ctx.client.user.id)) as GuildMember;
		const target = ctx.interaction.options.getMember('target') as GuildMember;
		let messagedUser = true;

		if (target.roles.highest.position > member.roles.highest.position) return await ctx.embedify('warn', 'user', 'Insufficient permissions.');
		if (!target.moderatable) return await ctx.embedify('warn', 'user', 'Target is not moderatable.');
		if (target.isCommunicationDisabled) return await ctx.embedify('warn', 'user', 'Target is not in a timeout.');
		
		await target
			.send(`Your timeout has been canceled in **${ctx.interaction.guild.name}**`)
			.catch(() => messagedUser = false );
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

		const content = `Timeout canceled for ${target.user.tag}${messagedUser ? '\nUser notified' : '\nCould not notify user'}`;
		return await ctx.embedify('success', 'user', content);
	};
}
