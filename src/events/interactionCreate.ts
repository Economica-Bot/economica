import { CommandInteraction } from 'discord.js';
import {
	Context,
	EconomicaClient,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
} from '../structures/index';
import { runtimeError } from '../util/util';
import { commandCheck } from '../util/command';
import { GuildModel } from '../models';

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
	const check = await commandCheck(interaction, data);

	if (check) {
		const guildDocument = await GuildModel.findOne({ guildId: interaction.guildId });
		const context = new Context(client, interaction, guildDocument);
		try {
			await command?.execute(context);
		} catch (err) {
			runtimeError(client, err, interaction);
		}
	}
}
