import { ChatInputCommandInteraction, Interaction, InteractionType } from 'discord.js';

import { Command } from '../entities/index.js';
import { commandCheck } from '../lib/index.js';
import { Context, Economica, Event } from '../structures/index.js';

export default class implements Event {
	public event = 'interactionCreate' as const;
	public async execute(client: Economica, interaction: Interaction<'cached'>): Promise<void> {
		client.log.debug(`Executing interaction ${InteractionType[interaction.type]}`);
		if (interaction.isChatInputCommand()) {
			await this.commandInteraction(client, interaction);
		}
	}

	private async commandInteraction(client: Economica, interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		const ctx = await new Context(client, interaction).init();
		const check = await commandCheck(ctx);
		if (check) {
			await client.commands.get(interaction.commandName).execute(ctx);
			await Command.create({ member: ctx.memberEntity, command: interaction.commandName }).save();
		}
	}
}
