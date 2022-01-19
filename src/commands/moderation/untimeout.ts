import { CommandInteraction, GuildMember } from 'discord.js';
import { InfractionModel } from '../../models/infractions';
import {
	Context,
	EconomicaClient,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
} from '../../structures/index';

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
		.addUserOption((option) =>
			option.setName('target').setDescription('Specify a target.').setRequired(true)
		);

	execute = async (ctx: Context) => {
		const member = (await ctx.interaction.guild.members.fetch(ctx.client.user.id)) as GuildMember;
		const target = ctx.interaction.options.getMember('target') as GuildMember;

		if (target.roles.highest.position > member.roles.highest.position) {
			return await ctx.interaction.reply('Insufficient permissions.');
		}

		if (!target.moderatable) {
			return await ctx.interaction.reply(`<@!${target.id}> is not moderatable.`);
		}

		if (!target.communicationDisabledUntil) {
			return await ctx.interaction.reply(`<@!${target.id}> is not in a timeout.`);
		}

		await target
			.send(`Your timeout has been canceled in **${ctx.interaction.guild.name}**`)
			.catch(
				async (err) => await ctx.interaction.reply(`Could not dm ${target.user.tag}\n\`${err}\``)
			);

		await target.timeout(null);

		await InfractionModel.updateMany(
			{
				userId: target.id,
				guildId: ctx.interaction.guild.id,
				type: 'mute',
				active: true,
			},
			{
				active: false,
			}
		);

		ctx.interaction.replied
			? ctx.interaction.followUp(`Timeout canceled for ${target.user.tag}`)
			: ctx.interaction.reply(`Timeout canceled for ${target.user.tag}`);
	};
}
