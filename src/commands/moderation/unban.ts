import { InfractionModel } from '../../models/infractions';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures/index';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('unban')
		.setDescription('Unban a member.')
		.setGroup('moderation')
		.setFormat('<member>')
		.setExamples(['unban 796906750569611294'])
		.setGlobal(false)
		.setUserPermissions(['BAN_MEMBERS'])
		.setClientPermissions(['BAN_MEMBERS'])
		.addUserOption((option) =>
			option.setName('target').setDescription('Specify a target.').setRequired(true)
		);

	execute = async (ctx: Context) => {
		const target = ctx.interaction.options.getUser('target');
		const ban = (await ctx.interaction.guild.bans.fetch()).get(target.id);

		if (!ban) {
			return await ctx.interaction.reply(`Could not find banned user with Id \`${target.id}\`.`);
		}

		await target
			.send(`You have been unbanned on **${ctx.interaction.guild.name}**`)
			.catch(async (err) => await ctx.interaction.reply(`Could not dm ${target.tag}\n\`${err}\``));

		await ctx.interaction.guild.members.unban(target);

		await InfractionModel.updateMany(
			{
				userId: target.id,
				guildId: ctx.interaction.guild.id,
				type: 'ban',
				active: true,
			},
			{
				active: false,
			}
		);

		ctx.interaction.replied
			? ctx.interaction.followUp(`Unbanned ${target.tag}`)
			: ctx.interaction.reply(`Unbanned ${target.tag}`);
	};
}
