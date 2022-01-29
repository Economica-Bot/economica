import { CommandInteraction } from 'discord.js';

import { commandCheck } from '../lib';
import { GuildModel } from '../models';
import { Context, EconomicaClient, EconomicaCommand, EconomicaSlashCommandBuilder } from '../structures';

export const name = 'interactionCreate';

export async function execute(client: EconomicaClient, interaction: CommandInteraction) {
	if (!interaction.isCommand()) {
		return;
	}

	const command = client.commands.get(interaction.commandName) as EconomicaCommand;
	if (!command) throw new Error(`There was an error while executing this command`);

	const guildDocument = await GuildModel.findOne({ guildId: interaction.guildId });
	const data = command.data as EconomicaSlashCommandBuilder;
	const ctx = new Context(client, interaction, guildDocument, data);
	const check = await commandCheck(ctx);

	if (check) {
		await command?.execute(ctx);
	}
}
