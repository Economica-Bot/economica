import { CommandInteraction } from 'discord.js';

import { commandCheck } from '../lib';
import { GuildModel, MemberModel } from '../models';
import { Context, EconomicaClient, EconomicaCommand, EconomicaSlashCommandBuilder } from '../structures';

export const name = 'interactionCreate';

export async function execute(client: EconomicaClient, interaction: CommandInteraction) {
	if (!interaction.isCommand()) {
		return;
	}

	const command = client.commands.get(interaction.commandName) as EconomicaCommand;
	client.commands.delete(interaction.commandName);
	if (!command) {
		interaction.reply({
			content: 'There was an error while executing this command. Attempting restart...',
			ephemeral: true,
		});
		throw new Error(`There was an error while executing this command`);
	}

	const guildDocument = await GuildModel.findOne({ guildId: interaction.guildId });
	const memberDocument = await MemberModel.findOne({ guildId: interaction.guildId, userId: interaction.user.id });
	const data = command.data as EconomicaSlashCommandBuilder;
	const ctx = new Context(client, interaction, data, guildDocument, memberDocument);
	const check = await commandCheck(ctx);

	if (check) {
		await command.execute(ctx);
	}
}
