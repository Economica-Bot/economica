import { datasource, Guild, Member } from '@economica/db';
import { EmbedBuilder } from 'discord.js';
import { recordTransaction } from '../lib';
import { parseNumber, validateAmount } from '../lib/economy';
import { Command } from '../structures/commands';

export const Withdraw = {
	identifier: /^withdraw$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const memberEntity = await datasource
			.getRepository(Member)
			.findOneByOrFail({
				userId: interaction.user.id,
				guildId: interaction.guildId
			});
		const guildEntity = await datasource
			.getRepository(Guild)
			.findOneByOrFail({ id: interaction.guildId });
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
