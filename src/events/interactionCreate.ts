import { AutocompleteInteraction, CommandInteraction, Interaction } from 'discord.js';

import { Command } from '../entity/command.js';
import { Guild } from '../entity/guild';
import { Member } from '../entity/member.js';
import { User } from '../entity/user.js';
import { Context, Economica, Event } from '../structures/index.js';
import { Occupations } from '../typings/index.js';

export default class implements Event {
	public event = 'interactionCreate' as const;
	public async execute(client: Economica, interaction: Interaction<'cached'>): Promise<void> {
		client.log.debug(`Executing interaction ${interaction.type}`);
		if (interaction.isCommand()) {
			await this.commandInteraction(client, interaction);
		} else if (interaction.isAutocomplete()) {
			await this.autocompleteInteraction(client, interaction);
		}
	}

	private async commandInteraction(client: Economica, interaction: CommandInteraction<'cached'>): Promise<void> {
		const ctx = await new Context(client, interaction).init();
		await client.commands.get(interaction.commandName).execute(ctx);
		const userRepository = client.connection.getRepository(User);
		const user = userRepository.create({ id: ctx.interaction.user.id });
		await userRepository.save(user);
		const guildRepository = client.connection.getRepository(Guild);
		const guild = guildRepository.create({ id: ctx.interaction.guildId });
		await guildRepository.save(guild);
		const memberRepositry = client.connection.getRepository(Member);
		await memberRepositry.upsert({ user, guild }, ['id']);
	}

	private async autocompleteInteraction(_client: Economica, interaction: AutocompleteInteraction): Promise<void> {
		let choices: string[];
		if (interaction.commandName === 'application') {
			if (interaction.options.getSubcommand() === 'apply') {
				const focusedOption = interaction.options.getFocused(true);
				if (focusedOption.name === 'occupation') choices = Object.keys(Occupations);
				const filtered = choices.filter((choice) => choice.toLowerCase().includes((focusedOption.value as string).toLowerCase()));
				await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
			}
		}
	}
}
