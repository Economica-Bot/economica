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

		const userRepo = client.connection.getRepository(User);
		const user = userRepo.create({ id: ctx.interaction.user.id });
		await userRepo.save(user);
		const guildRepo = client.connection.getRepository(Guild);
		const guild = guildRepo.create({ id: ctx.interaction.guildId });
		await guildRepo.save(guild);
		console.time();
		const test = await guildRepo.findOne({ relations: ['members', 'members.guild'] });
		console.timeEnd();
		console.dir(test);
		// const memberRepo = client.connection.getRepository(Member);
		// const member = memberRepo.create({ user, guild });
		// await memberRepo.save(member);
		// const commandRepo = client.connection.getRepository(Command);
		// const command = commandRepo.create({ member, command: interaction.commandName, createdAt: new Date() });
		// await commandRepo.save(command);

		// console.time();
		// const test = await guildRepo.findOne();
		// console.timeEnd();
		// console.log(test);
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
