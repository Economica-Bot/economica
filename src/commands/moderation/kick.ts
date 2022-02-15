import { GuildMember } from 'discord.js';

import { infraction, validateTarget } from '../../lib';
import { MemberModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('kick')
		.setDescription('Kick a member.')
		.setModule('MODERATION')
		.setFormat('<target> [reason]')
		.setExamples(['kick @JohnDoe', 'kick @Pepe Harrassment'])
		.setClientPermissions(['KICK_MEMBERS'])
		.setAuthority('MODERATOR')
		.addUserOption((option) => option.setName('target').setDescription('Specify a target.').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('Specify a reason.').setRequired(false));

	public execute = async (ctx: Context): Promise<void> => {
		if (!(await validateTarget(ctx))) return;
		const target = ctx.interaction.options.getMember('target') as GuildMember;
		const targetDocument = await MemberModel.findOneAndUpdate(
			{ guild: ctx.guildDocument, userId: target.id },
			{ guild: ctx.guildDocument, userId: target.id },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
		const reason = (ctx.interaction.options.getString('reason') as string) ?? 'No reason provided';
		let messagedUser = true;

		const dmEmbed = ctx
			.embedify('warn', 'user', `You have been kicked from **${ctx.interaction.guild.name}**`)
			.addField('Reason', reason, true);
		await target.send({ embeds: [dmEmbed] }).catch(() => (messagedUser = false));
		await target.kick(reason);
		await infraction(ctx.client, ctx.guildDocument, targetDocument, ctx.memberDocument, 'KICK', reason);

		const embed = ctx
			.embedify('success', 'user', `Kicked \`${target.user.tag}\``)
			.setFooter({ text: messagedUser ? 'User notified.' : 'Could not notify user.' });
		return await ctx.interaction.reply({ embeds: [embed] });
	};
}
