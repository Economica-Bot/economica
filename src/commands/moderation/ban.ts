import { GuildMember } from 'discord.js';
import {
	Context,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	InfractionTypes,
} from '../../structures/index';
import { infraction } from '../../util/util';
import ms from 'ms';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban a member.')
		.setGroup('moderation')
		.setFormat('<member> [length] [reason]')
		.setExamples([
			'ban @JohnDoe',
			'ban @Pepe 3h',
			'ban @Wumpus Spamming',
			'ban @YourMom420 2d Megalomania',
		])
		.setGlobal(false)
		.setUserPermissions(['BAN_MEMBERS'])
		.setClientPermissions(['BAN_MEMBERS'])
		.addUserOption((option) =>
			option.setName('target').setDescription('Specify a target.').setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('duration').setDescription('Specify a duration.').setRequired(false)
		)
		.addStringOption((option) =>
			option.setName('reason').setDescription('Specify a reason.').setRequired(false)
		)
		.addNumberOption((option) =>
			option
				.setName('days')
				.setDescription('Specify number of days of messages to delete.')
				.setMinValue(0)
				.setMaxValue(7)
				.setRequired(false)
		);

	execute = async (ctx: Context) => {
		const member = (await ctx.interaction.guild.members.fetch(ctx.client.user.id)) as GuildMember;
		const target = ctx.interaction.options.getMember('target') as GuildMember;
		const duration = ctx.interaction.options.getString('length') ?? 'Permanent';
		const reason = ctx.interaction.options.getString('reason') ?? 'No reason provided';
		const days = ctx.interaction.options.getNumber('days') ?? 0;

		if (target.id === ctx.interaction.user.id) {
			return await ctx.interaction.reply('You cannot ban yourself.');
		}

		if (target.id === ctx.client.user.id) {
			return await ctx.interaction.reply('I cannot ban myself.');
		}

		if (target.roles.highest.position > member.roles.highest.position) {
			return await ctx.interaction.reply('Insufficient permissions.');
		}

		if (!target.bannable) {
			return await ctx.interaction.reply(`<@!${target.id}> is not bannable.`);
		}

		const milliseconds = ms(duration);

		if (duration !== 'Permanent' && (!milliseconds || milliseconds < 0)) {
			return ctx.interaction.reply('Invalid duration.');
		}

		await target
			.send(
				`You have been banned for \`${reason}\` ${
					milliseconds ? `for ${ms(milliseconds)}` : 'permanently'
				} from **${ctx.interaction.guild.name}**`
			)
			.catch(
				async (err) => await ctx.interaction.reply(`Could not dm ${target.user.tag}\n\`${err}\``)
			);

		await target.ban({ days, reason });

		await infraction(
			ctx.client,
			ctx.interaction.guildId,
			target.id,
			ctx.interaction.user.id,
			InfractionTypes.Ban,
			reason,
			duration === 'Permanent' ? true : false,
			true,
			milliseconds
		);

		if (ctx.interaction.replied) {
			ctx.interaction.followUp(
				`Banned ${target.user.tag} ${milliseconds ? `for ${ms(milliseconds)}` : 'permanently'}.`
			);
		} else {
			ctx.interaction.reply(
				`Banned ${target.user.tag} ${milliseconds ? `for ${ms(milliseconds)}` : 'permanently'}.`
			);
		}
	};
}
