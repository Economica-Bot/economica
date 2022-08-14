import assert from 'assert';
import {
	ActionRowBuilder,
	APIEmbedField,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	codeBlock,
	EmbedBuilder,
	Interaction,
	MessageActionRowComponentBuilder,
	MessageComponentInteraction,
	parseEmoji,
	SelectMenuBuilder,
	WebhookEditMessageOptions,
} from 'discord.js';

import { Command } from '../entities';
import { commandCheck } from '../lib';
import { CommandError, Context, Economica, Event, ExecutionNode } from '../structures';
import { Emojis, Icons, PAGINATION_LIMIT } from '../typings';

export default class implements Event<'interactionCreate'> {
	public event = 'interactionCreate' as const;

	public async execute(client: Economica, interaction: Interaction<'cached'>): Promise<void> {
		try {
			if (interaction.isChatInputCommand()) {
				await this.chatInputCommand(interaction);
			} else if (interaction.isButton() || interaction.isSelectMenu()) {
				await this.messageComponent(interaction);
			}
		} catch (err) {
			assert(interaction.isRepliable());
			let description: string;
			if (err instanceof Error) {
				client.log.error(err);
				description = codeBlock('ts', err.toString());
			} else if (err instanceof CommandError) description = err.toString();
			const embed = new EmbedBuilder()
				.setAuthor({ name: 'Error', iconURL: client.emojis.resolve(parseEmoji(Emojis.CROSS).id).url })
				.setColor('Red')
				.setDescription(description);
			if (interaction.replied) await interaction.followUp({ embeds: [embed], ephemeral: true });
			else await interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}

	private async chatInputCommand(interaction: ChatInputCommandInteraction<'cached'>) {
		const ctx = await new Context(interaction).init();
		await commandCheck(ctx);
		await this.executionHandler(ctx);
		await Command.create({ member: ctx.memberEntity, command: ctx.interaction.commandName }).save();
	}

	private async messageComponent(interaction: MessageComponentInteraction<'cached'>) {
		let metadata: Record<string, any>;
		if (interaction.isButton()) metadata = JSON.parse(interaction.customId);
		else if (interaction.isSelectMenu()) metadata = JSON.parse(interaction.values.at(0));
		if (metadata.user !== interaction.user.id) {
			await interaction.deferUpdate();
			return;
		}

		const ctx = await new Context(interaction).init();
		await this.executionHandler(ctx);
	}

	private async findNode(ctx: Context, node: ExecutionNode, key: string): Promise<{ parent: ExecutionNode, node: ExecutionNode }> {
		if (node.value === key) return { parent: null, node };
		const options = node.resolver({});
		for await (const option of options) {
			if (option.value === key) return { parent: node, node: option };
			const result = await this.findNode(ctx, option, key);
			if (result.node) return result;
		}

		return { parent: null, node: null };
	}

	private async executionHandler(ctx: Context) {
		const rawKey = (ctx.interaction.isButton()
			? ctx.interaction.customId
			: ctx.interaction.isSelectMenu()
				? ctx.interaction.values[0]
				: ctx.interaction.isChatInputCommand()
					? JSON.stringify({ key: ctx.command.execution.value, index: 0, user: ctx.interaction.user.id })
					: null);
		const metadata = JSON.parse(rawKey);
		const { parent, node } = await this.findNode(ctx, ctx.command.execution, metadata.key);

		if (node.execution) await node.execution(ctx);

		const fields: APIEmbedField[] = [];
		const select = new SelectMenuBuilder().setCustomId(node.value);
		const buttons = new ActionRowBuilder<ButtonBuilder>();

		const options = node.resolver(await node.data(ctx)) ?? [];
		options.forEach((option) => {
			const description = option.description instanceof Function ? option.description(ctx) : option.description;
			if (option.type === 'button') {
				buttons.components.push(new ButtonBuilder()
					.setCustomId(JSON.stringify({ ...metadata, key: option.value, index: 0 }))
					.setLabel(option.name)
					.setStyle(ButtonStyle.Secondary));
			} else if (option.type === 'display' || option.type === 'displayInline') {
				fields.push({ name: option.name, value: description, inline: option.type === 'displayInline' });
			}
		});

		if (parent && node.returnable) {
			buttons.components.unshift(new ButtonBuilder()
				.setCustomId(JSON.stringify({ ...metadata, key: node.destination ?? parent.value, index: 0 }))
				.setLabel('Back')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji({ id: parseEmoji(Emojis.TRIANGLE_UP).id }));
		}

		let pages: number;
		options
			.filter((option) => option.type === 'select' || option.type === 'displayNumbered')
			.map((v, _, arr) => { pages = Math.ceil(arr.length / PAGINATION_LIMIT); return v; })
			.slice(metadata.index * PAGINATION_LIMIT, metadata.index * PAGINATION_LIMIT + PAGINATION_LIMIT)
			.forEach((option, index) => {
				const description = typeof option.description === 'function' ? option.description(ctx) : option.description;
				fields.push({ name: `${Icons[index]} ${option.name}`, value: description });
				if (option.type === 'select') select.addOptions({ label: option.name, value: JSON.stringify({ ...metadata, key: option.value, index: 0 }), emoji: { id: parseEmoji(Icons[index]).id } });
			});

		const embed = ctx
			.embedify('info', 'user', typeof node.description === 'function' ? node.description(ctx) : node.description)
			.setAuthor({ name: node.name })
			.addFields(fields);
		if (pages > 1) {
			embed.setFooter({ text: `Page ${metadata.index + 1} / ${pages}` });
			buttons.addComponents([
				new ButtonBuilder()
					.setCustomId(JSON.stringify({ ...metadata, index: metadata.index - 1 }))
					.setLabel('Previous')
					.setDisabled(metadata.index <= 0)
					.setEmoji({ id: parseEmoji(Emojis.PREVIOUS).id })
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId(JSON.stringify({ ...metadata, index: metadata.index + 1 }))
					.setLabel('Next')
					.setDisabled(metadata.index + 1 >= pages)
					.setEmoji({ id: parseEmoji(Emojis.NEXT).id })
					.setStyle(ButtonStyle.Primary),
			]);
			if (metadata.index > 0) fields.unshift({ name: `${Emojis.PREVIOUS} Previous`, value: 'Use `previous` to go to the previous page.' });
			if (metadata.index + 1 < pages) fields.push({ name: `${Emojis.NEXT} Next`, value: 'Use `next` to go to the next page.' });
		}

		const components: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];
		if (select.options.length) components.push(new ActionRowBuilder<SelectMenuBuilder>().addComponents(select));
		if (buttons.components.length) components.push(buttons);

		const payload: WebhookEditMessageOptions = { embeds: [embed], components };

		if (ctx.interaction.isChatInputCommand()) await ctx.interaction.reply({ ...payload, fetchReply: true });
		else if (ctx.interaction.isButton() || ctx.interaction.isSelectMenu()) {
			if (ctx.interaction.replied) await ctx.interaction.editReply(payload);
			else await ctx.interaction.update({ ...payload, fetchReply: true });
		}
	}
}
