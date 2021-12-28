import { CommandInteraction } from 'discord.js';
import EconomicaClient from '../../structures/EconomicaClient';
import EconomicaCommand from '../../structures/EconomicaCommand';
import { EconomicaSlashCommandBuilder } from '../../structures/EconomicaSlashCommandBuilder';
import * as util from '../../util';

export default class PingCommand extends EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('ping')
		.setDescription("Get Economica's latency.")
		.setGlobal(true)
		.setGroup('Utility');

	execute = async (
		client: EconomicaClient,
		interaction: CommandInteraction
	) => {
		await interaction.reply({
			embeds: [
				util.embedify(
					'GREEN',
					interaction.user.tag,
					interaction.user.displayAvatarURL(),
					`Pong! \`${client.ws.ping}ms\``
				),
			],
		});
	};
}
