import { EmbedBuilder } from 'discord.js';
import { recordTransaction } from '../lib';
import { parseNumber } from '../lib/economy';
import { Command } from '../structures/commands';

export const Beg = {
	identifier: /^beg$/,
	type: 'chatInput',
	execute: async ({ interaction, guildEntity }) => {
		const { max, chance } = guildEntity.incomes.beg;
		const amount = Math.ceil(Math.random() * max);
		if (Math.random() * 100 > chance)
			throw new Error('You begged and earned nothing :cry:');
		const embed = new EmbedBuilder().setDescription(
			`You begged and earned ${guildEntity.currency} \`${parseNumber(
				amount
			)}\`.`
		);
		await recordTransaction(
			interaction.guildId,
			interaction.user.id,
			interaction.client.user.id,
			'BEG',
			amount,
			0
		);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
