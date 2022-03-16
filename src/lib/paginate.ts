/* eslint-disable no-param-reassign */
import * as Discord from 'discord.js';

import { BUTTON_INTERACTION_COOLDOWN } from '../typings/index.js';

/**
 * Initiates a pagination embed display.
 * @param {Discord.CommandInteraction} interaction
 * @param {[Discord.MessageEmbed]} embeds
 * @param {number} index
 */
export async function paginate(
	interaction: Discord.CommandInteraction,
	embeds: Discord.MessageEmbed[],
	index = 0,
	components?: Discord.MessageComponent[],
) {
	if (!interaction.deferred) {
		await interaction.deferReply();
	}

	setTimeout(() => interaction.editReply({
		components: [],
	}), BUTTON_INTERACTION_COOLDOWN);

	const row = new Discord.MessageActionRow()
		.setComponents([
			new Discord.MessageButton().setCustomId('previous_page').setLabel('Previous').setStyle('SECONDARY').setDisabled(index === 0),
			new Discord.MessageButton().setCustomId('next_page').setLabel('Next').setStyle('PRIMARY').setDisabled(index === embeds.length - 1),
			...components,
		]);

	const msg = (await interaction.editReply({
		embeds: [embeds[index]],
		components: [row],
	})) as Discord.Message;

	const i = await msg.awaitMessageComponent({
		componentType: 'BUTTON',
	});

	if (index < embeds.length - 1 && index >= 0 && i.customId === 'next_page') {
		index += 1;
	} else if (index > 0 && index < embeds.length && i.customId === 'previous_page') {
		index -= 1;
	}

	await paginate(interaction, embeds, index, components);
}
