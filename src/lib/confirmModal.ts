import { ButtonInteraction, CommandInteraction, Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';

import { BUTTON_INTERACTION_COOLDOWN } from '../typings/constants.js';
import { ConfirmModalEmbeds } from '../typings/index.js';

/**
 * Creates an embed confirm modal with CONFIRM and CANCEL buttons.
 * @param {CommandInteraction} interaction - Can be defered or un-deferred
 * @param {ConfirmModalEmbeds} embeds - an object of type ConfirmModalEmbeds
 * @param {Function} confirmCallback - a function with parameters. What is executed when confirmed
 * @param {boolean} ephemeral - only the user can see?
 * @returns {boolean} confirmed?
 */
export async function confirmModal(interaction: CommandInteraction, { promptEmbed, confirmEmbed, cancelEmbed }: ConfirmModalEmbeds, confirmCallback: (reply: Message<boolean>, confirmEmbed: MessageEmbed) => void, ephemeral?: boolean): Promise<boolean> {
	let confirmed = false;

	if (!interaction.deferred) {
		await interaction.deferReply({
			ephemeral,
		});
	}

	const components = [new MessageActionRow()
		.addComponents([
			new MessageButton()
				.setCustomId('confirm')
				.setLabel('Delete All')
				.setStyle('DANGER'),
			new MessageButton()
				.setCustomId('cancel')
				.setLabel('Cancel')
				.setStyle('SECONDARY'),
		])];

	const reply = (await interaction.editReply({
		embeds: [promptEmbed],
		components,
	})) as Message;

	const filter = (click: ButtonInteraction): boolean => click.user.id === interaction.user.id;

	const collector = reply.createMessageComponentCollector<'BUTTON'>({
		filter,
		time: BUTTON_INTERACTION_COOLDOWN,
	});

	collector.on('collect', async (click) => {
		if (click.customId === 'confirm') {
			await click.update({
				embeds: [confirmEmbed],
				components: [],
			});

			confirmed = true;
			collector.stop();
		} else if (click.customId === 'cancel') { collector.stop(); }
	});

	collector.on('end', async () => {
		if (confirmed) { await confirmCallback(reply, confirmEmbed); } else {
			await interaction.editReply({
				embeds: [cancelEmbed],
				components: [],
			});
		}
	});

	return confirmed;
}
