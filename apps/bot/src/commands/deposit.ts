import { EmbedBuilder } from 'discord.js';
import { recordTransaction } from '../lib';
import { parseNumber, validateAmount } from '../lib/economy';
import { trpc } from '../lib/trpc';
import { Command } from '../structures/commands';

export const Deposit = {
	identifier: /^deposit$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const memberEntity = await trpc.member.byId.query({
			userId: interaction.user.id,
			guildId: interaction.guildId
		});
		const guildEntity = await trpc.guild.byId.query({
			id: interaction.guildId
		});
		const amount = interaction.options.getString('amount', true);
		const result = validateAmount(memberEntity.wallet, amount, 'wallet');
		await recordTransaction(
			interaction.guildId,
			interaction.user.id,
			interaction.user.id,
			'DEPOSIT',
			-result,
			result
		);
		const embed = new EmbedBuilder()
			.setTitle('Success')
			.setDescription(
				`Deposited ${guildEntity.currency} \`${parseNumber(result)}\``
			);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
