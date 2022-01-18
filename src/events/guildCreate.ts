import { Guild } from 'discord.js';
import { EconomicaClient } from '../structures/index';
import { guildDocument } from '../models/index';

import config from '../../config.json';

export const name = 'guildCreate';

export async function execute(client: EconomicaClient, guild: Guild) {
	const guildSettings = await guildDocument.findOneAndUpdate(
		{
			guildID: guild.id,
		},
		{
			currency: config.cSymbol,
			transactionLogChannel: null,
			infractionLogChannel: null,
		},
		{
			upsert: true,
			new: true,
		}
	);

	return guildSettings;
}
