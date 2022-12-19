import { EmbedBuilder } from 'discord.js';
import { recordTransaction } from '../lib';
import { parseNumber, parseString } from '../lib/economy';
import { trpc } from '../lib/trpc';
import { Command } from '../structures/commands';

export const SetBalance = {
	identifier: /^set-balance$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const target = interaction.options.getUser('user', true);
		const targetEntity = await trpc.member.create.mutate({
			userId: target.id,
			guildId: interaction.guildId
		});
		const guildEntity = await trpc.guild.byId.query({
			id: interaction.guildId
		});
		await trpc.member.byId.query({
			userId: target.id,
			guildId: interaction.guildId
		});
		const amount = parseString(interaction.options.getString('amount', true));
		const balance = interaction.options.getString('balance', true);
		const { wallet: w, treasury: t } = targetEntity;
		const difference = balance === 'wallet' ? amount - w : amount - t;
		const wallet = balance === 'wallet' ? difference : 0;
		const treasury = balance === 'treasury' ? difference : 0;
		if (!amount) throw new Error('Please enter a valid amount.');
		await recordTransaction(
			interaction.guildId,
			target.id,
			interaction.user.id,
			'SET_MONEY',
			wallet,
			treasury
		);
		const embed = new EmbedBuilder()
			.setTitle('Success')
			.setDescription(
				`Set ${target}'s \`${balance}\` to ${
					guildEntity.currency
				} \`${parseNumber(amount)}\``
			);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
