import { Awaitable, Message, MessageComponentInteraction } from 'discord.js';

import { Context } from '../structures';
import { Emojis } from '../typings';

export async function collectProp<T>(ctx: Context, interaction: MessageComponentInteraction<'cached'>, property: string, prompt: string, validators: { function: (msg: Message, ctx: Context) => Awaitable<boolean>, error: string }[], parse: (msg: Message, ctx: Context) => Awaitable<T>, skippable = false): Promise<T> {
	await ctx.clientMemberEntity.reload();
	await ctx.clientUserEntity.reload();
	await ctx.memberEntity.reload();
	await ctx.userEntity.reload();

	const embed = ctx.embedify('info', 'user', `Specify the \`${property}\` property.`);
	const message = interaction.replied ? await interaction.editReply({ embeds: [embed] }) : await interaction.update({ embeds: [embed], fetchReply: true });
	const res = await message.channel.awaitMessages({ filter: (msg) => msg.author.id === interaction.user.id, max: 1 });
	const input = res.first();

	if (input.content === 'skip') {
		return null;
	}

	if (input.content === 'cancel') {
		const embed = ctx.embedify('warn', 'user', `${Emojis.CROSS} Input Canceled`);
		await interaction.editReply({ embeds: [embed], components: [] });
		return null;
	}

	// eslint-disable-next-line no-restricted-syntax
	for await (const validator of validators) {
		const res = await validator.function(input, ctx);
		if (!res) {
			await interaction.followUp({ content: `Invalid input.\nError: ${validator.error}`, ephemeral: true });
			return collectProp(ctx, interaction, property, prompt, validators, parse, skippable);
		}
	}

	return parse(input, ctx);
}
