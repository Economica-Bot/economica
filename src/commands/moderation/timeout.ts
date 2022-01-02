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

	execute = async (client: EconomicaClient, interaction: CommandInteraction): Promise<any> => {
		const member = (await interaction.guild.members.fetch(client.user.id)) as GuildMember;
		const target = interaction.options.getMember('target') as GuildMember;
		const duration = interaction.options.getString('duration') as string;
		const reason = (interaction.options.getString('reason') as string) ?? 'No reason provided';

		if (target.id === interaction.user.id) {
			return await interaction.reply('You cannot timeout yourself.');
		}

		if (target.id === client.user.id) {
			return await interaction.reply('I cannot timeout myself.');
		}

		if (target.roles.highest.position > member.roles.highest.position) {
			return await interaction.reply('Insufficient permissions.');
		}

		if (!target.moderatable) {
			return await interaction.reply(`<@!${target.id}> is not moderatable.`);
		}

		if (
			target.communicationDisabledUntil &&
			target.communicationDisabledUntil.getTime() > Date.now()
		) {
			return await interaction.reply(`<@!${target.id}> is already in a timeout.`);
		}

		const milliseconds = ms(duration);

		if (!milliseconds || milliseconds < 0) {
			return interaction.reply('Invalid duration.');
		}

		await target
			.send(
				`You have been placed under a timeout for \`${reason}\` for ${ms(milliseconds)} in **${
					interaction.guild.name
				}**`
			)
			.catch(async (err) => await interaction.reply(`Could not dm ${target.user.tag}\n\`${err}\``));

		await target.timeout(milliseconds, reason);

		await infraction(
			client,
			interaction.guildId,
			target.id,
			interaction.user.id,
			InfractionTypes.Timeout,
			reason,
			duration === 'Permanent' ? true : false,
			true,
			milliseconds
		);

		if (interaction.replied) {
			interaction.followUp(`Placed ${target.user.tag} under a timeout for ${ms(milliseconds)}.`);
		} else {
			interaction.reply(`Placed ${target.user.tag} under a timeout for ${ms(milliseconds)}.`);
		}
	};
}
