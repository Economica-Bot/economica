import { EmbedBuilder } from 'discord.js';
import { recordTransaction } from '../lib';
import { parseNumber } from '../lib/economy';
import { trpc } from '../lib/trpc';
import { Command } from '../structures/commands';

export const Rob = {
	identifier: /^rob$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const target = interaction.options.getUser('user', true);
		const targetEntity = await trpc.member.byId.query({
			userId: target.id,
			guildId: interaction.guildId
		});
		const guildEntity = await trpc.guild.byId.query({
			id: interaction.guildId
		});
		const amount = Math.ceil(Math.random() * targetEntity.wallet);
		const { chance, minfine, maxfine } = guildEntity.incomes.rob;
		const fine = Math.ceil(Math.random() * (maxfine - minfine) + minfine);
		if (target.id === interaction.client.user.id)
			throw new Error('You cannot rob me!');
		if (interaction.user.id === target.id)
			throw new Error('You cannot rob yourself');
		if (targetEntity.wallet <= 0)
			throw new Error(`<@!${target.id}> has no money to rob!`);
		if (Math.random() * 100 > chance) {
			await recordTransaction(
				interaction.guildId,
				interaction.user.id,
				interaction.client.user.id,
				'ROB_FINE',
				0,
				-fine
			);
			const embed = new EmbedBuilder().setDescription(
				`You were caught and fined ${guildEntity.currency} \`${parseNumber(
					fine
				)}\`.`
			);
			await interaction.reply({ embeds: [embed] });
			return;
		}
		await recordTransaction(
			interaction.guildId,
			interaction.client.user.id,
			target.id,
			'ROB_SUCCESS',
			amount,
			0
		);
		await recordTransaction(
			interaction.guildId,
			target.id,
			interaction.client.user.id,
			'ROB_VICTIM',
			-amount,
			0
		);
		const embed = new EmbedBuilder().setDescription(
			`You stole ${guildEntity.currency} \`${parseNumber(
				amount
			)}\` from ${target}.`
		);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
