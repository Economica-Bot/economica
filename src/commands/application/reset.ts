import { CommandInteraction } from 'discord.js';
import EconomicaClient from '../../structures/EconomicaClient';
import EconomicaCommand from '../../structures/EconomicaCommand';
import { EconomicaSlashCommandBuilder } from '../../structures/EconomicaSlashCommandBuilder';
import { embedify } from '../../util';

export default class ResetCommand extends EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('reset')
		.setDescription('Reset all slash commands');
	execute = async (
		client: EconomicaClient,
		interaction: CommandInteraction
	) => {
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
