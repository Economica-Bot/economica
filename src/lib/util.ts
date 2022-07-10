import {
	ActionRowBuilder,
	Awaitable,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	MessageComponentInteraction,
	ModalBuilder,
	ModalMessageModalSubmitInteraction,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';

import { Context, ContextEmbed } from '../structures';

export async function collectProp<T>(ctx: Context, interaction: MessageComponentInteraction<'cached'>, base: ContextEmbed, property: string, validators: { function: (input: string) => Awaitable<boolean>, error: string }[], parse: (input: string) => Awaitable<T>, skippable = false): Promise<T> {
	const embed = new EmbedBuilder(base.data);
	embed.setDescription(`Specify the \`${property}\` property.`);
	const components = [
		new ActionRowBuilder<ButtonBuilder>()
			.setComponents(
				new ButtonBuilder()
					.setCustomId('input')
					.setLabel('Input')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('skip')
					.setLabel('Skip')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(!skippable),
				new ButtonBuilder()
					.setCustomId('cancel')
					.setLabel('Cancel')
					.setStyle(ButtonStyle.Danger),
			),
	];

	const message = interaction.replied ? await interaction.editReply({ embeds: [embed], components }) : await interaction.update({ embeds: [embed], components, fetchReply: true });
	const res = await message.awaitMessageComponent({ componentType: ComponentType.Button, filter: (int) => int.user.id === interaction.user.id });

	if (res.customId === 'input') {
		const modal = new ModalBuilder()
			.setCustomId('modal')
			.setTitle(`Specifying a ${property}`)
			.setComponents([
				new ActionRowBuilder<TextInputBuilder>()
					.setComponents([
						new TextInputBuilder()
							.setCustomId('modal_input')
							.setLabel(`Specify a new ${property} (type: ${typeof property})`)
							.setRequired(true)
							.setStyle(TextInputStyle.Short),
					]),
			]);

		await res.showModal(modal);
		const modalSubmit = await res.awaitModalSubmit({ time: 0 }) as ModalMessageModalSubmitInteraction;
		const input = modalSubmit.fields.getTextInputValue('modal_input');

		const errors = [];
		// eslint-disable-next-line no-restricted-syntax
		for await (const validator of validators) {
			const res = await validator.function(input);
			if (!res) {
				errors.push(validator.error);
				break;
			}
		}

		if (errors.length) {
			await modalSubmit.reply({ content: `Invalid input.\nErrors: ${errors.map((error) => `\`${error}\``).join('\n')}`, ephemeral: true });
			return collectProp(ctx, interaction, base, property, validators, parse, skippable);
		}

		await modalSubmit.reply({ content: 'Input success.', ephemeral: true });
		return parse(input);
	} if (res.customId === 'skip' || res.customId === 'cancel') {
		await res.update(res.customId);
		return null;
	}

	return null;
}
