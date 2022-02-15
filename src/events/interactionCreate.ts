import { AutocompleteInteraction, CommandInteraction, Interaction } from 'discord.js';

import { commandCheck } from '../lib';
import { OccupationArr } from '../models/applications';
import { Context, EconomicaClient, EconomicaEvent } from '../structures';

export default class implements EconomicaEvent {
	public name = 'interactionCreate' as const;
	public async execute(client: EconomicaClient, interaction: Interaction): Promise<void> {
		if (interaction.isCommand()) {
			return this.commandInteraction(client, interaction);
		} else if (interaction.isAutocomplete()) {
			return this.autocompleteInteraction(client, interaction);
		}
	}

	private async commandInteraction(client: EconomicaClient, interaction: CommandInteraction): Promise<void> {
		const ctx = await new Context(client, interaction).init();
		const check = await commandCheck(ctx);
		if (check) {
			ctx.memberDocument.commands.push({
				member: ctx.memberDocument,
				command: interaction.commandName,
			});

			await ctx.memberDocument.save();
			await client.commands.get(interaction.commandName).execute(ctx);
		}
	}

	private async autocompleteInteraction(client: EconomicaClient, interaction: AutocompleteInteraction): Promise<void> {
		let choices;
		if (interaction.commandName === 'application') {
			if (interaction.options.getSubcommand() === 'apply') {
				const focusedOption = interaction.options.getFocused(true);
				if (focusedOption.name === 'occupation') choices = OccupationArr;
				const filtered = choices.filter((choice) =>
					choice.toLowerCase().includes((focusedOption.value as string).toLowerCase())
				);
				await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
			}
		}
	}
}
