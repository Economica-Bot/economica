import { GuildMember } from 'discord.js';
import {
	Context,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	InfractionTypes,
} from '../../structures/index';
import { infraction } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('kick')
		.setDescription('Kick a member.')
		.setGroup('moderation')
		.setFormat('<target> [reason]')
		.setExamples(['kick @JohnDoe', 'kick @Pepe Harrassment'])
		.setGlobal(false)
		.setUserPermissions(['KICK_MEMBERS'])
		.setClientPermissions(['KICK_MEMBERS'])
		.addUserOption((option) =>
			option.setName('target').setDescription('Specify a target.').setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('reason').setDescription('Specify a reason.').setRequired(false)
		);

	execute = async (ctx: Context) => {
		const member = (await ctx.interaction.guild.members.fetch(ctx.client.user.id)) as GuildMember;
		const target = ctx.interaction.options.getMember('target') as GuildMember;
		const reason = (ctx.interaction.options.getString('reason') as string) ?? 'No reason provided';

		if (target.id === ctx.interaction.user.id) {
			return await ctx.interaction.reply('You cannot kick yourself.');
		}

		if (target.id === ctx.client.user.id) {
			return await ctx.interaction.reply('I cannot kick myself.');
		}

		if (target.roles.highest.position > member.roles.highest.position) {
			return await ctx.interaction.reply('Insufficient permissions.');
		}

		if (!target.kickable) {
			return await ctx.interaction.reply(`<@!${target.id}> is not kickable.`);
		}

		await target
			.send(`You have been kicked for \`${reason}\` from **${ctx.interaction.guild.name}**`)
			.catch(
				async (err) => await ctx.interaction.reply(`Could not dm ${target.user.tag}\n\`${err}\``)
			);

		await target.kick(reason);

		await infraction(
			ctx.client,
			ctx.interaction.guildId,
			target.id,
			ctx.interaction.user.id,
			InfractionTypes.Kick,
			reason
		);

		if (ctx.interaction.replied) {
			return await ctx.interaction.followUp(`Kicked ${target.user.tag}`);
		} else {
			return await ctx.interaction.reply(`Kicked ${target.user.tag}`);
		}
	};
}
