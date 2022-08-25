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
import { pathToRegexp } from 'path-to-regexp';
import qs from 'qs';

import { Command } from '../entities';
import { commandCheck } from '../lib';
import { CommandError, Context, Economica, Event } from '../structures';
import { Emojis, Icons, PaginationLimit } from '../typings';

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
			if (err instanceof CommandError) {
				description = err.toString();
			} else if (err instanceof Error) {
				client.log.error(err);
				description = codeBlock('ts', err.toString());
			}

			const embed = new EmbedBuilder()
				.setAuthor({ name: 'Error', iconURL: client.emojis.resolve(parseEmoji(Emojis.CROSS).id).url })
				.setColor('Red')
				.setDescription(description);
			if (interaction.replied) await interaction.followUp({ embeds: [embed], ephemeral: true });
			else await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => null);
		}
	}

	private async chatInputCommand(interaction: ChatInputCommandInteraction<'cached'>) {
		const ctx = await new Context(interaction).init();
		await commandCheck(ctx);
		try {
			await this.executionHandler(ctx);
		} finally {
			await Command.create({ member: ctx.memberEntity, command: ctx.interaction.commandName }).save();
		}
	}

	private async messageComponent(interaction: MessageComponentInteraction<'cached'>) {
		let metadata: Record<string, any>;
		if (interaction.isButton()) metadata = qs.parse(interaction.customId);
		else if (interaction.isSelectMenu()) metadata = qs.parse(interaction.values.at(0));
		if (metadata.user !== interaction.user.id) {
			await interaction.deferUpdate();
			return;
		}

		const ctx = await new Context(interaction).init();
		await this.executionHandler(ctx);
	}

	private async executionHandler(ctx: Context, rawpathlike?: string) {
		const rawpath = rawpathlike ?? (ctx.interaction.isButton()
			? ctx.interaction.customId
			: ctx.interaction.isSelectMenu()
				? ctx.interaction.values[0]
				: ctx.interaction.isChatInputCommand()
					? qs.stringify({ path: `${ctx.command.metadata.name}`, index: 0, user: ctx.interaction.user.id })
					: null);
		const metadata = qs.parse(rawpath);
		const { path, index: indexString } = metadata as { path: string, index: string };
		const index = parseInt(indexString);

		console.log(rawpath, metadata);

		let match: RegExpExecArray;
		const params = {};
		const keys = [];
		const layer = ctx.command.execution.stack.find((layer) => {
			keys.length = 0;
			const regex = pathToRegexp(`${ctx.command.metadata.name}${layer.path}`, keys);
			match = regex.exec(path);
			return !!match;
		});

		if (!match) throw new Error('Something went wrong!');

		for (let i = 1; i < match.length; i++) {
			const key = keys[i - 1];
			const prop = key.name;
			const val = match[i];
			params[prop] = val;
		}

		const node = await layer.handle(ctx, params);

		if (typeof node === 'string') {
			const newpath = qs.stringify({ path: `${ctx.command.metadata.name}${node}`, index: 0, user: ctx.interaction.user.id });
			await this.executionHandler(ctx, newpath);
			return;
		}

		const embed = ctx
			.embedify('info', 'user', node.description)
			.setAuthor({ name: node.name });
		const fields: APIEmbedField[] = [];
		const select = new SelectMenuBuilder().setCustomId(ctx.command.metadata.name);
		const buttons = new ActionRowBuilder<ButtonBuilder>();

		node.options.forEach((option) => {
			if (option[0] === 'button') {
				buttons.components.push(
					new ButtonBuilder()
						.setCustomId(qs.stringify({ path: `${ctx.command.metadata.name}${option[1]}`, index: 0, user: ctx.interaction.user.id }))
						.setLabel(option[2])
						.setStyle(ButtonStyle.Success),
				);
			} else if (option[0] === 'display') {
				fields.push({ name: option[1], value: option[2] });
			} else if (option[0] === 'displayInline') {
				fields.push({ name: option[1], value: option[2], inline: true });
			} else if (option[0] === 'back') {
				buttons.components.unshift(
					new ButtonBuilder()
						.setCustomId(qs.stringify({ path: `${ctx.command.metadata.name}${option[1]}`, index: 0, user: ctx.interaction.user.id }))
						.setLabel('Back')
						.setStyle(ButtonStyle.Secondary)
						.setEmoji({ id: parseEmoji(Emojis.TRIANGLE_UP).id }),
				);
			} else if (option[0] === 'image') {
				embed.setImage(option[1]);
			}
		});

		let pages: number;
		node.options
			.filter((option) => option[0] === 'select' || option[0] === 'displayNumbered')
			.map((v, _, arr) => { pages = Math.ceil(arr.length / PaginationLimit); return v; })
			.slice(index * PaginationLimit, index * PaginationLimit + PaginationLimit)
			.forEach((option, index) => {
				if (option[0] === 'select') {
					fields.push({ name: `${Icons[index]} ${option[2]}`, value: option[3] });
					select.addOptions({
						label: option[2],
						value: qs.stringify({ path: `${ctx.command.metadata.name}${option[1]}`, index: 0, user: ctx.interaction.user.id }),
						emoji: {
							id: parseEmoji(Icons[index]).id,
						},
					});
				} else if (option[0] === 'displayNumbered') {
					fields.push({ name: `${Icons[index]} ${option[1]}`, value: option[2] });
				}
			});

		embed.addFields(fields);
		if (pages > 1) {
			embed.setFooter({ text: `Page ${index + 1} / ${pages}` });
			buttons.addComponents([
				new ButtonBuilder()
					.setCustomId(qs.stringify({ ...metadata, index: index - 1 }))
					.setLabel('Previous')
					.setDisabled(index <= 0)
					.setEmoji({ id: parseEmoji(Emojis.PREVIOUS).id })
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId(qs.stringify({ ...metadata, index: index + 1 }))
					.setLabel('Next')
					.setDisabled(index + 1 >= pages)
					.setEmoji({ id: parseEmoji(Emojis.NEXT).id })
					.setStyle(ButtonStyle.Primary),
			]);
			if (index > 0) fields.unshift({ name: `${Emojis.PREVIOUS} Previous`, value: 'Use `previous` to go to the previous page.' });
			if (index + 1 < pages) fields.push({ name: `${Emojis.NEXT} Next`, value: 'Use `next` to go to the next page.' });
		}

		const components: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];
		if (select.options.length) components.push(new ActionRowBuilder<SelectMenuBuilder>().addComponents(select));
		if (buttons.components.length) components.push(buttons);

		const payload: WebhookEditMessageOptions = { embeds: [embed], components };

		if (ctx.interaction.isChatInputCommand()) await ctx.interaction.reply(payload);
		else if (ctx.interaction.isButton() || ctx.interaction.isSelectMenu()) {
			if (ctx.interaction.replied) await ctx.interaction.editReply(payload);
			else await ctx.interaction.update(payload);
		}
	}
}
