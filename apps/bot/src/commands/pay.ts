import { EmbedBuilder } from 'discord.js';
import { recordTransaction } from '../lib';
import { parseNumber, validateAmount } from '../lib/economy';
import { trpc } from '../lib/trpc';
import { Command } from '../structures/commands';

export const Pay = {
	identifier: /^pay$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const target = interaction.options.getUser('user', true);
		await trpc.user.create.mutate({ id: target.id });
		await trpc.member.create.mutate({
			userId: target.id,
			guildId: interaction.guildId
		});
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
			target.id,
			'GIVE_PAYMENT',
			-result,
			0
		);
		await recordTransaction(
			interaction.guildId,
			target.id,
			interaction.user.id,
			'RECEIVE_PAYMENT',
			result,
			0
		);
		const embed = new EmbedBuilder()
			.setTitle('Success')
			.setDescription(
				`Paid ${target} ${guildEntity.currency} \`${parseNumber(result)}\``
			);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
