import {
	ActionRowBuilder,
	APIEmbedField,
	APISelectMenuOption,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	Interaction,
	InteractionType,
	MessageComponentInteraction,
	parseEmoji,
	SelectMenuBuilder,
} from 'discord.js';

import { Command } from '../entities';
import { collectProp, commandCheck } from '../lib';
import { Context, Economica, Event, ExecutionBuilder } from '../structures';
import { Emojis, Icons, PAGINATION_LIMIT } from '../typings';

export class InteractionCreateEvent implements Event {
	public event = 'interactionCreate' as const;
	public async execute(client: Economica, interaction: Interaction<'cached'>): Promise<void> {
		client.log.debug(`Executing interaction ${InteractionType[interaction.type]}`);
		if (interaction.isChatInputCommand()) {
			await this.chatInputCommand(client, interaction);
		}
	}

	private async chatInputCommand(client: Economica, interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		const ctx = await new Context(client, interaction).init();
		const check = await commandCheck(ctx);
		if (check) {
			await this.execution(ctx, client.commands.get(interaction.commandName).execute);
			await Command.create({ member: ctx.memberEntity, command: interaction.commandName }).save();
		}
	}

	private async execution(ctx: Context, ex: ExecutionBuilder, index = 0, interaction?: MessageComponentInteraction<'cached'>): Promise<void> {
		if (ex.variableCollectors) {
			// eslint-disable-next-line no-restricted-syntax
			for await (const variableCollector of ex.variableCollectors) {
				const { property, prompt, validators, parse, skippable } = variableCollector;
				const res = await collectProp(ctx, interaction, property, prompt, validators, parse, skippable);
				if (!res && !skippable) return;
				ex.variables[property] = res;
			}
		}

		if (ex.execution) {
			const res = await ex.execution(ctx, interaction);
			if (res) await this.execution(ctx, res, index, interaction);
			return;
		}

		if (ex.elements) {
			const elements = await ex.elements(ctx);
			ex.options = elements.map((element) => ex.func(element, ctx));
		}

		const options = ex.options
			.filter((option) => ctx.interaction.member.permissions.has(option.permissions) && option.enabled)
			.slice(index * PAGINATION_LIMIT, index * PAGINATION_LIMIT + PAGINATION_LIMIT);
		const fields = options.map((option) => ({ name: option.name, value: option.description }) as APIEmbedField);
		const selectOptions = options.map((option) => ({ label: option.name, value: option.value }) as APISelectMenuOption);
		const row1 = new ActionRowBuilder<SelectMenuBuilder>()
			.setComponents([new SelectMenuBuilder().setCustomId('option').setOptions(selectOptions)]);
		const row2 = new ActionRowBuilder<ButtonBuilder>();
		for (let i = 0; i < fields.length; i++) {
			fields[i].name = `${Icons[i]} ${fields[i].name}`;
			row1.components[0].options[i].data.emoji = { id: parseEmoji(Icons[i]).id };
		}

		if (index > 0) {
			fields.unshift({ name: `${Emojis.PREVIOUS} Back`, value: 'Use `back` to go to the previous page.' });
			row2.addComponents([
				new ButtonBuilder()
					.setCustomId('back')
					.setLabel('Back')
					.setEmoji({ id: parseEmoji(Emojis.PREVIOUS).id })
					.setStyle(ButtonStyle.Secondary),
			]);
		}

		if (index + 1 < Math.ceil(ex.options.length / PAGINATION_LIMIT)) {
			fields.push({ name: `${Emojis.NEXT} Next`, value: 'Use `next` to go to the next page.' });
			row2.addComponents([
				new ButtonBuilder()
					.setCustomId('next')
					.setLabel('Next')
					.setEmoji({ id: parseEmoji(Emojis.NEXT).id })
					.setStyle(ButtonStyle.Primary),
			]);
		}

		const embed = (ex.embed ?? ctx
			.embedify('info', 'user', `${ex.description}`)
			.setAuthor({ name: ex.name }))
			.setFooter({ text: `Page ${index + 1} / ${Math.ceil(ex.options.length / PAGINATION_LIMIT) || 1}` })
			.addFields(fields);
		const components = [];
		if (row1.components[0].options.length) components.push(row1);
		if (row2.components.length) components.push(row2);
		const payload = { embeds: [embed], components };
		// eslint-disable-next-line no-nested-ternary
		const msg = interaction && !interaction.replied
			? await interaction.update({ ...payload, fetchReply: true })
			: ctx.interaction.replied
				? await ctx.interaction.editReply(payload)
				: await ctx.interaction.reply({ ...payload, fetchReply: true });
		const int = await msg.awaitMessageComponent({ filter: (i) => i.user.id === ctx.interaction.user.id }) as MessageComponentInteraction<'cached'>;
		if (int.isButton()) {
			await this.execution(ctx, ex, int.customId === 'next' ? ++index : --index, int);
		} else if (int.isSelectMenu()) {
			const newex = ex.options.find((option) => option.value === int.values[0]);
			await this.execution(ctx, newex, 0, int);
		}
	}
}
