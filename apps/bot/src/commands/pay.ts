import { datasource, Guild, Member, User } from '@economica/db';
import { EmbedBuilder } from 'discord.js';
import { recordTransaction } from '../lib';
import { parseNumber, validateAmount } from '../lib/economy';
import { Command } from '../structures/commands';

export const Pay = {
	identifier: /^pay$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const target = interaction.options.getUser('user', true);
		await datasource.getRepository(User).save({ id: target.id });
		await datasource
			.getRepository(Member)
			.save({ userId: target.id, guildId: interaction.guildId });
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
