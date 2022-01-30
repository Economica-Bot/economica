import { Guild } from 'discord.js';

import { CURRENCY_SYMBOL, income } from '../config';
import { GuildModel } from '../models';
import { EconomicaClient } from '../structures';

export const name = 'guildCreate';

export async function execute(client: EconomicaClient, guild: Guild) {
	const guildSettings = await GuildModel.findOneAndUpdate(
		{
			guildId: guild.id,
		},
		{
			currency: CURRENCY_SYMBOL,
			transactionLogChannel: null,
			infractionLogChannel: null,
			auth: [],
			income,
		},
		{
			upsert: true,
			new: true,
		}
	);

	return guildSettings;
}
