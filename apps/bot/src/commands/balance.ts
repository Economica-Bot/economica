import { EmbedBuilder } from 'discord.js';
import { parseNumber } from '../lib/economy';
import { Command } from '../structures/commands';
import { createMemberDTO } from '../utils';

export const Balance = {
	identifier: /^balance$/,
	type: 'chatInput',
	execute: async ({ interaction, guildEntity }) => {
		const target = interaction.options.getUser('user') ?? interaction.user;
		const targetEntity = await createMemberDTO(target.id, interaction.guildId);
		const embed = new EmbedBuilder()
			.setAuthor({
				name: `${target.username}'s Balance`,
				iconURL: target.displayAvatarURL()
			})
			.addFields([
				{
					name: 'Wallet',
					value: `${guildEntity.currency} \`${parseNumber(
						targetEntity.wallet
					)}\``,
					inline: true
				},
				{
					name: 'Treasury',
					value: `${guildEntity.currency} \`${parseNumber(
						targetEntity.treasury
					)}\``,
					inline: true
				},
				{
					name: 'Total',
					value: `${guildEntity.currency} \`${parseNumber(
						targetEntity.wallet + targetEntity.treasury
					)}\``,
					inline: true
				}
			]);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
