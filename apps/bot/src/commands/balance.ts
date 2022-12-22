import { datasource, Guild, Member } from '@economica/db';
import { EmbedBuilder } from 'discord.js';
import { parseNumber } from '../lib/economy';
import { Command } from '../structures/commands';

export const Balance = {
	identifier: /^balance$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const target = interaction.options.getUser('user') ?? interaction.user;
		const guildEntity = await datasource
			.getRepository(Guild)
			.findOneByOrFail({ id: interaction.guildId });
		await datasource.getRepository(Member).upsert(
			{
				userId: target.id,
				guildId: interaction.guildId
			},
			{
				conflictPaths: ['userId', 'guildId']
			}
		);
		const targetEntity = await datasource
			.getRepository(Member)
			.findOneByOrFail({
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
