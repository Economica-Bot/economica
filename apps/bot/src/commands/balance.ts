import { EmbedBuilder } from 'discord.js';
import { parseNumber } from '../lib/economy';
import { trpc } from '../lib/trpc';
import { Command } from '../structures/commands';

export const Balance = {
	identifier: /^balance$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const target = interaction.options.getUser('user') ?? interaction.user;
		await trpc.member.create.mutate({
			userId: target.id,
			guildId: interaction.guildId
		});
		const guildEntity = await trpc.guild.byId.query({
			id: interaction.guildId
		});
		const targetEntity = await trpc.member.byId.query({
			userId: target.id,
			guildId: interaction.guildId
		});
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
