import { datasource, Guild, Member, User } from '@economica/db';
import { EmbedBuilder } from 'discord.js';
import { recordTransaction } from '../lib';
import { parseNumber, parseString } from '../lib/economy';
import { Command } from '../structures/commands';

export const AddMoney = {
	identifier: /^add-money$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const amount = interaction.options.getString('amount', true);
		const balance = interaction.options.getString('balance', true);
		const parsedAmount = parseString(amount);
		if (!parsedAmount) throw new Error(`Invalid amount: \`${amount}\``);
		const wallet = balance === 'wallet' ? parsedAmount : 0;
		const treasury = balance === 'treasury' ? parsedAmount : 0;
		const target = interaction.options.getUser('target', true);
		await datasource.getRepository(User).save({ id: target.id });
		await datasource.getRepository(Member).save({
			userId: target.id,
			guildId: interaction.guildId
		});
		const guildEntity = await datasource.getRepository(Guild).findOneByOrFail({
			id: interaction.guildId
		});
		const embed = new EmbedBuilder()
			.setTitle('Success')
			.setDescription(
				`Added ${guildEntity.currency} \`${parseNumber(
					parsedAmount
				)}\` to ${target} ${balance}.`
			);
		await recordTransaction(
			interaction.guildId,
			target.id,
			interaction.user.id,
			'ADD_MONEY',
			wallet,
			treasury
		);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
