/* eslint-disable no-param-reassign */
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
	EmbedBuilder,
	Message,
	MessageActionRowComponentBuilder,
} from 'discord.js';
import { INTERACTION_COMPONENT_COOLDOWN } from '../typings';

/**
 * Initiates a pagination embed display.
 * @param {Discord.CommandInteraction} interaction
 * @param {[Discord.EmbedBuilder]} embeds
 * @param {number} index
 */
export async function paginate(interaction: ChatInputCommandInteraction, embeds: EmbedBuilder[], index = 0) {
	if (!interaction.deferred) {
		await interaction.deferReply();
	}

	if (index > embeds.length - 1 || index < 0) {
		await interaction.editReply({ content: `Page number out of bounds!\nTotal pages: ${embeds.length}` });
		return;
	}

	setTimeout(
		() => interaction.editReply({
			components: [],
		}),
		INTERACTION_COMPONENT_COOLDOWN,
	);

	const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents([
		new ButtonBuilder()
			.setCustomId('previous_page')
			.setLabel('Previous')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(index === 0),
		new ButtonBuilder()
			.setCustomId('next_page')
			.setLabel('Next')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(index === embeds.length - 1),
	]);

	const msg = (await interaction.editReply({ embeds: [embeds[index]], components: [row] })) as Message<true>;
	const i = await msg
		.awaitMessageComponent({ componentType: ComponentType.Button, time: INTERACTION_COMPONENT_COOLDOWN })
		.catch(() => null);
	if (index < embeds.length - 1 && index >= 0 && i.customId === 'next_page') {
		index += 1;
	} else if (index > 0 && index < embeds.length && i.customId === 'previous_page') {
		index -= 1;
	}

	await paginate(interaction, embeds, index);
}
