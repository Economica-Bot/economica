import { InfractionModel } from '../../models/infractions';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('unban')
		.setDescription('Unban a member.')
		.setGroup('MODERATION')
		.setFormat('<member>')
		.setExamples(['unban 796906750569611294'])
		.setClientPermissions(['BAN_MEMBERS'])
		.setAuthority('MODERATOR')
		.addUserOption((option) => option.setName('target').setDescription('Specify a target.').setRequired(true));

	execute = async (ctx: Context) => {
		const target = ctx.interaction.options.getUser('target');
		const ban = (await ctx.interaction.guild.bans.fetch()).get(target.id);
		let messagedUser = true;

		if (!ban) return await ctx.interaction.reply('Could not find banned user with that id.');

		await target
			.send(`You have been unbanned on **${ctx.interaction.guild.name}**`)
			.catch(() => (messagedUser = false));
		await ctx.interaction.guild.members.unban(target);
		await InfractionModel.updateMany(
			{
				userId: target.id,
				guildId: ctx.interaction.guild.id,
				type: 'BAN',
				active: true,
			},
			{
				active: false,
			}
		);

		const content = `Unbanned ${target.tag}${messagedUser ? '\nUser notified' : '\nCould not notify user'}`;
		return await ctx.embedify('success', 'user', content);
	};
}
