import { CommandInteraction, GuildMember, Message } from 'discord.js';
import EconomicaClient from '../../structures/EconomicaClient';
import EconomicaCommand from '../../structures/EconomicaCommand';
import { EconomicaSlashCommandBuilder } from '../../structures/EconomicaSlashCommandBuilder';
import { infraction } from '../../util';

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

	execute = async (client: EconomicaClient, interaction: CommandInteraction): Promise<any> => {
		const member = (await interaction.guild.members.fetch(client.user.id)) as GuildMember;
		const target = interaction.options.getMember('target') as GuildMember;
		const reason = (interaction.options.getString('reason') as string) ?? 'No reason provided';

		if (target.id === interaction.user.id) {
			return await interaction.reply('You cannot kick yourself.');
		}

		if (target.id === client.user.id) {
			return await interaction.reply('I cannot kick myself.');
		}

		if (target.roles.highest.position > member.roles.highest.position) {
			return await interaction.reply('Insufficient permissions.');
		}

		if (!target.kickable) {
			return await interaction.reply(`<@!${target.id}> is not kickable.`);
		}

		await target
			.send(`You have been kicked for \`${reason}\` from **${interaction.guild.name}**`)
			.catch(async (err) => await interaction.reply(`Could not dm ${target.user.tag}\n\`${err}\``));

		await target.kick(reason);

		await infraction(
			client,
			interaction.guildId,
			target.id,
			interaction.user.id,
			'`moderation:KICK`',
			reason
		);

		if (interaction.replied) {
			return await interaction.followUp(`Kicked ${target.user.tag}`);
		} else {
			return await interaction.reply(`Kicked ${target.user.tag}`);
		}
	};
}
