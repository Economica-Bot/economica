import { EmbedBuilder } from 'discord.js';
import { recordTransaction } from '../lib';
import { parseNumber, validateAmount } from '../lib/economy';
import { Command } from '../structures/commands';

export const Withdraw = {
	identifier: /^withdraw$/,
	type: 'chatInput',
	execute: async ({ interaction, memberEntity, guildEntity }) => {
		const amount = interaction.options.getString('amount', true);
		const result = validateAmount(memberEntity.treasury, amount, 'treasury');
		await recordTransaction(
			interaction.guildId,
			interaction.user.id,
			interaction.user.id,
			'WITHDRAW',
			result,
			-result
		);
		const embed = new EmbedBuilder()
			.setTitle('Success')
			.setDescription(
				`Withdrew ${guildEntity.currency} \`${parseNumber(result)}\``
			);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
