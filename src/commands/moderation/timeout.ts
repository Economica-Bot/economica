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
		.setName('timeout')
		.setDescription('Timeout a member.')
		.setGroup('moderation')
		.setFormat('<member> [duration] [reason]')
		.setExamples([
			'timeout @JohnDoe',
			'timeout @Pepe 3h',
			'timeout @Wumpus Spamming',
			'timeout @YourMom420 2d Megalomania',
		])
		.setGlobal(false)
		.setUserPermissions(['MODERATE_MEMBERS'])
		.setClientPermissions(['MODERATE_MEMBERS'])
		.addUserOption((option) =>
			option.setName('target').setDescription('Specify a target.').setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('duration').setDescription('Specify a length.').setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('reason').setDescription('Specify a reason.').setRequired(false)
		);

	execute = async (ctx: Context) => {
		const member = (await ctx.interaction.guild.members.fetch(ctx.client.user.id)) as GuildMember;
		const target = ctx.interaction.options.getMember('target') as GuildMember;
		const duration = ctx.interaction.options.getString('duration') as string;
		const reason = (ctx.interaction.options.getString('reason') as string) ?? 'No reason provided';

		if (target.id === ctx.interaction.user.id) {
			return await ctx.interaction.reply('You cannot timeout yourself.');
		}

		if (target.id === ctx.client.user.id) {
			return await ctx.interaction.reply('I cannot timeout myself.');
		}

		if (target.roles.highest.position > member.roles.highest.position) {
			return await ctx.interaction.reply('Insufficient permissions.');
		}

		if (!target.moderatable) {
			return await ctx.interaction.reply(`<@!${target.id}> is not moderatable.`);
		}

		if (
			target.communicationDisabledUntil &&
			target.communicationDisabledUntil.getTime() > Date.now()
		) {
			return await ctx.interaction.reply(`<@!${target.id}> is already in a timeout.`);
		}

		const milliseconds = ms(duration);

		if (!milliseconds || milliseconds < 0) {
			return ctx.interaction.reply('Invalid duration.');
		}

		await target
			.send(
				`You have been placed under a timeout for \`${reason}\` for ${ms(milliseconds)} in **${
					ctx.interaction.guild.name
				}**`
			)
			.catch(
				async (err) => await ctx.interaction.reply(`Could not dm ${target.user.tag}\n\`${err}\``)
			);

		await target.timeout(milliseconds, reason);

		await infraction(
			ctx.client,
			ctx.interaction.guildId,
			target.id,
			ctx.interaction.user.id,
			InfractionTypes.Timeout,
			reason,
			duration === 'Permanent' ? true : false,
			true,
			milliseconds
		);

		const content = `Placed ${target.user.tag} under a timeout for ${ms(milliseconds)}.`;
		return await (ctx.interaction.replied
			? ctx.interaction.followUp(content)
			: ctx.interaction.reply(content));
	};
}
