import { CommandInteraction } from 'discord.js';

import { commandCheck } from '../lib';
import { Context, EconomicaClient, EconomicaEvent } from '../structures';

export default class implements EconomicaEvent {
	public name = 'interactionCreate' as const;
	public async execute(client: EconomicaClient, interaction: CommandInteraction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}

		const ctx = await new Context(client, interaction).init();
		const check = await commandCheck(ctx);

		if (check) {
			await client.commands.get(interaction.commandName).execute(ctx);
		}
	}
}
