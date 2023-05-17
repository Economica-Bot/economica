import { datasource, Item } from '@economica/db';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder
} from 'discord.js';
import { Command } from '../structures/commands';
import { PAGINATION_LIMIT } from '../types';

export const Inventory = {
	identifier: /^inventory$/,
	type: 'chatInput',
	execute: async (interaction) => {
		await InventoryPage.execute(interaction, undefined as never);
	}
} satisfies Command<'chatInput'>;

export const InventoryPage = {
	identifier: /^inventory_page:(?<userId>(.*)):(?<page>(.*))$/,
	type: 'button',
	execute: async (interaction, args) => {
		let page: number;
		let userId: string;
		if (interaction.isChatInputCommand()) {
			userId = (interaction.options.getUser('user') ?? interaction.user).id;
			page = interaction.options.getInteger('page') ?? 1;
		} else {
			userId = args.groups.userId;
			page = +args.groups.page;
		}

		const items = await datasource.getRepository(Item).find({
			relations: ['listing'],
			where: { owner: { userId, guildId: interaction.guildId } }
		});

		const embed = new EmbedBuilder()
			.setTitle('Viewing Inventory')
			.setDescription(
				`Viewing <@${userId}>'s items | \`${items
					.map((item) => item.amount)
					.reduce((prev, curr) => prev + curr, 0)}\` total`
			)
			.setFields(
				items.map((item) => ({
					name: `${item.amount} x ${item.listing.name}`,
					value: item.listing.description
				}))
			);
		const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
			new ButtonBuilder()
				.setCustomId(`inventory_page:${interaction.user.id}:${page - 1}`)
				.setLabel('Previous Page')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === 1),
			new ButtonBuilder()
				.setCustomId(`inventory_page:${interaction.user.id}:${page + 1}`)
				.setLabel('Next Page')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(items.length < PAGINATION_LIMIT)
		);
		interaction.isChatInputCommand()
			? await interaction.reply({ embeds: [embed], components: [row] })
			: await interaction.update({ embeds: [embed], components: [row] });
	}
} satisfies Command<'button' | 'chatInput', 'userId' | 'page'>;
