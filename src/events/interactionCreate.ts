import { ChatInputCommandInteraction, Interaction } from 'discord.js';

import { Command } from '../entities';
import { commandCheck } from '../lib';
import { Context, Economica, Event } from '../structures/index.js';

export default class implements Event {
	public event = 'interactionCreate' as const;
	public async execute(client: Economica, interaction: Interaction<'cached'>): Promise<void> {
		client.log.debug(`Executing interaction ${interaction.type}`);
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
