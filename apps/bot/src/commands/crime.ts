import { EmbedBuilder } from 'discord.js';
import { recordTransaction } from '../lib';
import { parseNumber } from '../lib/economy';
import { trpc } from '../lib/trpc';
import { Command } from '../structures/commands';

export const Crime = {
	identifier: /^crime$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const guildEntity = await trpc.guild.byId.query({
			id: interaction.guildId
		});
		const { max, chance, minfine, maxfine } = guildEntity.incomes.crime;
		const amount = Math.ceil(Math.random() * max);
		const fine = Math.ceil(Math.random() * (maxfine - minfine) + minfine);
		if (Math.random() * 100 > chance) {
			await recordTransaction(
				interaction.guildId,
				interaction.user.id,
				interaction.client.user.id,
				'CRIME_FINE',
				0,
				-fine
			);
			const embed = new EmbedBuilder().setDescription(
				`You were caught and fined ${guildEntity.currency} \`${parseNumber(
					fine
				)}\`.`
			);
			await interaction.reply({ embeds: [embed] });
		} else {
			await recordTransaction(
				interaction.guildId,
				interaction.user.id,
				interaction.client.user.id,
				'CRIME_SUCCESS',
				amount,
				0
			);
			const embed = new EmbedBuilder().setDescription(
				`You successfully committed a crime and earned ${
					guildEntity.currency
				} \`${parseNumber(amount)}\`.`
			);
			await interaction.reply({ embeds: [embed] });
		}
	}
} satisfies Command<'chatInput'>;
