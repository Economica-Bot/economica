import { CommandInteraction } from 'discord.js';

import { commandCheck } from '../lib';
import { Context, EconomicaClient } from '../structures';

export const name = 'interactionCreate';

export async function execute(client: EconomicaClient, interaction: CommandInteraction) {
	if (!interaction.isCommand()) {
		return;
	}

	const ctx = await new Context(client, interaction).init();
	const check = await commandCheck(ctx);

	if (check) {
		await client.commands.get(interaction.commandName).execute(ctx);
	}
}
