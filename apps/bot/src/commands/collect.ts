import { Emojis, ListingType } from '@economica/common';
import { datasource, Item, Guild } from '@economica/db';
import { recordTransaction } from '../lib';
import { parseNumber } from '../lib/economy';
import { Command } from '../structures/commands';

export const Collect = {
	identifier: /^collect$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const guildEntity = await datasource
			.getRepository(Guild)
			.findOneByOrFail({ id: interaction.guildId });
		const generators = await datasource.getRepository(Item).find({
			relations: ['listing'],
			where: {
				owner: { userId: interaction.user.id, guildId: interaction.guildId },
				listing: { type: ListingType.GENERATOR }
			}
		});
		let amount = 0;
		generators.forEach(async (generator) => {
			if (
				Date.now() <
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				generator.listing.generatorPeriod! +
					(generator.lastGeneratedAt?.getTime() ?? 0)
			)
				return;
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			amount += generator.listing.generatorAmount!;
			await datasource
				.getRepository(Item)
				.update({ id: generator.id }, { lastGeneratedAt: new Date() });
		});

		let result: string;
		if (amount) {
			result = `${Emojis.CHECK} Collected ${
				guildEntity.currency
			} \`${parseNumber(amount)}\``;
			await recordTransaction(
				interaction.guildId,
				interaction.user.id,
				interaction.user.id,
				'GENERATOR',
				0,
				amount
			);
		} else {
			result =
				'You have **no money ready** to collect.' +
				`\n${generators.map(
					(generator) =>
						`**${generator.listing.name}** - ${
							guildEntity.currency
						} \`${parseNumber(
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							generator.listing.generatorAmount!
						)}\` | **Ready:** <t:${Math.trunc(
							(generator.lastGeneratedAt.getTime() +
								// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
								generator.listing.generatorPeriod!) /
								1000
						)}:R>`
				)}`;
		}

		await interaction.reply({
			embeds: [
				{
					title: 'Collecting Generator Funds',
					description: result
				}
			]
		});
	}
} satisfies Command<'chatInput'>;
