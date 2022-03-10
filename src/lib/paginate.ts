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
) {
	if (!interaction.deferred) {
		await interaction.deferReply();
	}

	let row = new Discord.MessageActionRow()
		.addComponents(
			new Discord.MessageButton()
				.setCustomId('previous_page')
				.setLabel('Previous')
				.setStyle('SECONDARY')
				.setDisabled(index === 0),
		)
		.addComponents(
			new Discord.MessageButton()
				.setCustomId('next_page')
				.setLabel('Next')
				.setStyle('PRIMARY')
				.setDisabled(index === embeds.length - 1),
		);

	const msg = (await interaction.editReply({
		embeds: [embeds[index]],
		components: [row],
	})) as Discord.Message;

	const filter = (i: Discord.ButtonInteraction): boolean => i.user.id === interaction.user.id;

	const collector = msg.createMessageComponentCollector<'BUTTON'>({
		filter,
		time: BUTTON_INTERACTION_COOLDOWN,
	});

	collector.on('collect', async (i) => {
		if (index < embeds.length - 1 && index >= 0 && i.customId === 'next_page') {
			index += 1;
			row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setCustomId('previous_page')
						.setLabel('Previous')
						.setStyle('SECONDARY')
						.setDisabled(index === 0),
				)
				.addComponents(
					new Discord.MessageButton()
						.setCustomId('next_page')
						.setLabel('Next')
						.setStyle('PRIMARY')
						.setDisabled(index === embeds.length - 1),
				);
		} else if (index > 0 && index < embeds.length && i.customId === 'previous_page') {
			index += 1;
			row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setCustomId('previous_page')
						.setLabel('Previous')
						.setStyle('SECONDARY')
						.setDisabled(index === 0),
				)
				.addComponents(
					new Discord.MessageButton()
						.setCustomId('next_page')
						.setLabel('Next')
						.setStyle('PRIMARY')
						.setDisabled(index === embeds.length - 1),
				);
		}

		await i.update({ embeds: [embeds[index]], components: [row] });
	});

	collector.on('end', async () => {
		await msg.edit({ components: [] }).catch();
	});
}
