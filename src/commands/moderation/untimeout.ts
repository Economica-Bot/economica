import { CommandInteraction, GuildMember } from 'discord.js';
import { InfractionModel } from '../../models/infractions';
import {
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

	execute = async (client: EconomicaClient, interaction: CommandInteraction): Promise<any> => {
		const member = (await interaction.guild.members.fetch(client.user.id)) as GuildMember;
		const target = interaction.options.getMember('target') as GuildMember;

		if (target.roles.highest.position > member.roles.highest.position) {
			return await interaction.reply('Insufficient permissions.');
		}

		if (!target.moderatable) {
			return await interaction.reply(`<@!${target.id}> is not moderatable.`);
		}

		if (!target.communicationDisabledUntil) {
			return await interaction.reply(`<@!${target.id}> is not in a timeout.`);
		}

		await target
			.send(`Your timeout has been canceled in **${interaction.guild.name}**`)
			.catch(async (err) => await interaction.reply(`Could not dm ${target.user.tag}\n\`${err}\``));

		await target.timeout(null);

		await InfractionModel.updateMany(
			{
				userID: target.id,
				guildID: interaction.guild.id,
				type: 'mute',
				active: true,
			},
			{
				active: false,
			}
		);

		if (interaction.replied) {
			interaction.followUp(`Timeout canceled for ${target.user.tag}`);
		} else {
			interaction.reply(`Timeout canceled for ${target.user.tag}`);
		}
	};
}
