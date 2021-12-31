import { CommandInteraction } from 'discord.js';
import { InfractionModel } from '../../models/infractions';
import {
	EconomicaClient,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	InfractionTypes,
} from '../../structures/index';

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

	execute = async (client: EconomicaClient, interaction: CommandInteraction): Promise<any> => {
		const target = interaction.options.getUser('target');
		const ban = (await interaction.guild.bans.fetch()).get(target.id);

		if (!ban) {
			return await interaction.reply(`Could not find banned user with ID \`${target.id}\`.`);
		}

		await target
			.send(`You have been unbanned on **${interaction.guild.name}**`)
			.catch(async (err) => await interaction.reply(`Could not dm ${target.tag}\n\`${err}\``));

		await interaction.guild.members.unban(target);

		await InfractionModel.updateMany(
			{
				userID: target.id,
				guildID: interaction.guild.id,
				type: 'ban',
				active: true,
			},
			{
				active: false,
			}
		);

		if (interaction.replied) {
			interaction.followUp(`Unbanned ${target.tag}`);
		} else {
			interaction.reply(`Unbanned ${target.tag}`);
		}
	};
}
