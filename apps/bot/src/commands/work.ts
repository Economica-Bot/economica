import { datasource, Guild } from '@economica/db';
import { EmbedBuilder } from 'discord.js';
import { recordTransaction } from '../lib';
import { parseNumber } from '../lib/economy';
import { Command } from '../structures/commands';

export const Work = {
	identifier: /^work$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const guildEntity = await datasource
			.getRepository(Guild)
			.findOneByOrFail({ id: interaction.guildId });
		const { currency } = guildEntity;
		const { max } = guildEntity.incomes.work;
		const amount = Math.ceil(Math.random() * max);
		await recordTransaction(
			interaction.guildId,
			interaction.user.id,
			interaction.client.user.id,
			'WORK',
			amount,
			0
		);
		const embed = new EmbedBuilder().setDescription(
			`You worked and earned ${currency} \`${parseNumber(amount)}\`.`
		);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
