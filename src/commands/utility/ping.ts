import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { PermissionRole } from '../../structures/CommandOptions';
import EconomicaClient from '../../structures/EconomicaClient';
import EconomicaCommand from '../../structures/EconomicaCommand';
import { EconomicaSlashCommandBuilder } from '../../structures/EconomicaSlashCommandBuilder';
import * as util from '../../util';

export default class PingCommand extends EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('ping')
		.setDescription("Get Economica's latency.")
		.setGlobal(true)
		.setGroup('Utility')
		.setFormat('ping')
		.setRoles([new PermissionRole('Ping_Role', true)])
		.setClientPermissions(['SEND_MESSAGES'])
		.setUserPermissions(['SEND_MESSAGES'])
		.addEconomicaSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('testsubcommandgroup')
				.setDescription('Description')
				.addEconomicaSubcommand((subcommand) =>
					subcommand
						.setName('test')
						.setDescription('This is a test')
						.addStringOption((option) =>
							option.setName('test').setDescription('Description')
						)
				)
		);

	execute = async (
		client: EconomicaClient,
		interaction: CommandInteraction
	) => {
		const test = new SlashCommandBuilder().addSubcommand((subcommand) =>
			subcommand.setName('test')
		);

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
