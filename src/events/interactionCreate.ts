import { CommandInteraction } from 'discord.js';
import {
	EconomicaClient,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
} from '../structures/index';
import { runtimeError } from '../util/util';
import { commandCheck } from '../util/command';

export const name = 'interactionCreate';

export async function execute(client: EconomicaClient, interaction: CommandInteraction) {
	if (!interaction.isCommand()) {
		return;
	}

	const command = client.commands.get(interaction.commandName) as EconomicaCommand;
	try {
		if (!command) {
			throw new Error(`There was an error while executing this command`);
		}
	} catch (err) {
		runtimeError(client, err, interaction);
	}

	const data = command.data as EconomicaSlashCommandBuilder;
	try {
		if (await commandCheck(interaction, data)) {
			await command?.execute(client, interaction);
		}
	} catch (err) {
		runtimeError(client, err, interaction);
	}
}
