import { EmbedBuilder, Message, MessageComponentInteraction } from 'discord.js';

import { Context, ContextEmbed } from '../structures';
import { Promisable } from '../typings';

export async function collectProp<T>(ctx: Context, interaction: MessageComponentInteraction<'cached'>, base: ContextEmbed, property: string, validate: (msg: Message<true>) => Promisable<boolean>, parse: (msg: Message<true>) => Promisable<T>, skippable = false): Promise<T> {
	const embed = new EmbedBuilder(base.data);
	embed.setDescription(`Specify the \`${property}\` property.`);
	if (skippable) embed.setFooter({ text: 'Enter "skip" to skip' });
	if (interaction.replied) await interaction.editReply({ embeds: [embed], components: [] });
	else await interaction.update({ embeds: [embed], components: [] });
	const res = await interaction.channel.awaitMessages({ max: 1, filter: (msg) => msg.author.id === interaction.user.id });
	if (skippable && res.first().content.toLowerCase() === 'skip') return null;
	if (!(await validate(res.first() as Message<true>))) {
		await interaction.followUp({ embeds: [ctx.embedify('error', 'user', `Invalid \`${property}\`.`)], ephemeral: true });
		return collectProp(ctx, interaction, base, property, validate, parse, skippable);
	}

	return parse(res.first() as Message<true>);
}
