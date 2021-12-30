import { CommandInteraction } from 'discord.js';
import {
	EconomicaClient,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
} from '../../structures/index';
import { embedify } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('reset')
		.setDescription('Reset all slash commands')
		.setGroup('application')
		.setDevOnly(true);
	execute = async (client: EconomicaClient, interaction: CommandInteraction) => {
		await interaction.deferReply({ ephemeral: true });
		await interaction.guild.commands.set([]);
		await client.application.commands.set([]);
		await interaction.editReply({
			embeds: [
				embedify(
					'GREEN',
					interaction.user.username,
					interaction.user.avatarURL(),
					'`RESET ALL SLASH COMMANDS`'
				),
			],
		});
	};
}
