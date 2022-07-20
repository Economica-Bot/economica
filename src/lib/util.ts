import { MessageComponentInteraction } from 'discord.js';

import { Context, VariableCollector } from '../structures';
import { Emojis } from '../typings';

export async function collectProp(
	ctx: Context,
	interaction: MessageComponentInteraction<'cached'>,
	variableCollector: VariableCollector,
) {
	await ctx.clientMemberEntity.reload();
	await ctx.clientUserEntity.reload();
	await ctx.memberEntity.reload();
	await ctx.userEntity.reload();

	const embed = ctx
		.embedify('info', 'user', variableCollector.prompt)
		.setAuthor({ name: `Specifying the ${variableCollector.property} property` })
		.setFooter({ text: `Enter "cancel" to cancel ${variableCollector.skippable ? ', "skip" to skip' : ''}.` });
	const message = interaction.replied
		? await interaction.editReply({ embeds: [embed], components: [] })
		: await interaction.update({ embeds: [embed], components: [], fetchReply: true });
	const res = await message.channel.awaitMessages({ filter: (msg) => msg.author.id === interaction.user.id, max: 1 });
	const input = res.first();

	if (input.content === 'skip') {
		return null;
	}

	if (input.content === 'cancel') {
		const embed = ctx.embedify('warn', 'user', `${Emojis.CROSS} Input Cancelled`);
		await interaction.editReply({ embeds: [embed], components: [] });
		return null;
	}

	// eslint-disable-next-line no-restricted-syntax
	for await (const validator of variableCollector.validators) {
		const res = await validator.func(input, ctx);
		if (!res) {
			const embed = ctx
				.embedify('error', 'user', `\`\`\`${validator.error}\`\`\``)
				.setFooter({ text: "Try again, or type 'cancel' to cancel input." });
			await interaction.followUp({ embeds: [embed], ephemeral: true });
			return collectProp(ctx, interaction, variableCollector);
		}
	}

	return variableCollector.parse(input, ctx);
}
