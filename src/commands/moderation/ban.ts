import { CommandInteraction, GuildMember } from 'discord.js';
import {
	EconomicaClient,
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

	execute = async (client: EconomicaClient, interaction: CommandInteraction): Promise<any> => {
		const member = (await interaction.guild.members.fetch(client.user.id)) as GuildMember;
		const target = interaction.options.getMember('target') as GuildMember;
		const duration = interaction.options.getString('length') ?? 'Permanent';
		const reason = interaction.options.getString('reason') ?? 'No reason provided';
		const days = interaction.options.getNumber('days') ?? 0;

		if (target.id === interaction.user.id) {
			return await interaction.reply('You cannot ban yourself.');
		}

		if (target.id === client.user.id) {
			return await interaction.reply('I cannot ban myself.');
		}

		if (target.roles.highest.position > member.roles.highest.position) {
			return await interaction.reply('Insufficient permissions.');
		}

		if (!target.bannable) {
			return await interaction.reply(`<@!${target.id}> is not bannable.`);
		}

		const milliseconds = ms(duration);

		if (duration !== 'Permanent' && (!milliseconds || milliseconds < 0)) {
			return interaction.reply('Invalid duration.');
		}

		await target
			.send(
				`You have been banned for \`${reason}\` ${
					milliseconds ? `for ${ms(milliseconds)}` : 'permanently'
				} from **${interaction.guild.name}**`
			)
			.catch(async (err) => await interaction.reply(`Could not dm ${target.user.tag}\n\`${err}\``));

		await target.ban({ days, reason });

		await infraction(
			client,
			interaction.guildId,
			target.id,
			interaction.user.id,
			InfractionTypes.Ban,
			reason,
			duration === 'Permanent' ? true : false,
			true,
			milliseconds
		);

		if (interaction.replied) {
			interaction.followUp(
				`Banned ${target.user.tag} ${milliseconds ? `for ${ms(milliseconds)}` : 'permanently'}.`
			);
		} else {
			interaction.reply(
				`Banned ${target.user.tag} ${milliseconds ? `for ${ms(milliseconds)}` : 'permanently'}.`
			);
		}
	};
}
