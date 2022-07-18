import {
	ActionRowBuilder,
	Awaitable,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	MessageComponentInteraction,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';

import { Context } from '../structures';
import { Emojis } from '../typings';

export async function collectProp<T>(ctx: Context, interaction: MessageComponentInteraction<'cached'>, property: string, prompt: string, validators: { function: (ctx: Context, input: string) => Awaitable<boolean>, error: string }[], parse: (ctx: Context, input: string) => Awaitable<T>, skippable = false): Promise<T> {
	await ctx.clientMemberEntity.reload();
	await ctx.clientUserEntity.reload();
	await ctx.memberEntity.reload();
	await ctx.userEntity.reload();
	const embed = ctx.embedify('info', 'user', `Specify the \`${property}\` property.`);
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
							.setLabel(prompt)
							.setRequired(true)
							.setStyle(TextInputStyle.Short),
					]),
			]);

		await res.showModal(modal);
		const modalSubmit = await res.awaitModalSubmit({ time: 0 });
		const input = modalSubmit.fields.getTextInputValue('modal_input');

		const errors = [];
		// eslint-disable-next-line no-restricted-syntax
		for await (const validator of validators) {
			const res = await validator.function(ctx, input);
			if (!res) {
				errors.push(validator.error);
				break;
			}
		}

		if (errors.length) {
			await modalSubmit.reply({ content: `Invalid input.\nErrors: ${errors.map((error) => `\`${error}\``).join('\n')}`, ephemeral: true });
			return collectProp(ctx, interaction, property, prompt, validators, parse, skippable);
		}

		await modalSubmit.reply({ content: 'Input success.', ephemeral: true });
		return parse(ctx, input);
	} if (res.customId === 'skip') {
		const embed = ctx.embedify('warn', 'user', `${Emojis.CONTROLS} Input Skipped`);
		await res.update({ embeds: [embed], components: [] });
		return null;
	} if (res.customId === 'cancel') {
		const embed = ctx.embedify('warn', 'user', `${Emojis.CROSS} Input Canceled`);
		await res.update({ embeds: [embed], components: [] });
	}

	return null;
}
