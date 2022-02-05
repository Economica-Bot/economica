import { Guild } from 'discord.js';

import { CURRENCY_SYMBOL, income } from '../config';
import { GuildModel } from '../models';
import { EconomicaClient, EconomicaEvent } from '../structures';

export default class implements EconomicaEvent {
	public name = 'guildCreate' as const;
	public async execute(client: EconomicaClient, guild: Guild): Promise<void> {
		await GuildModel.findOneAndUpdate(
			{
				guildId: guild.id,
			},
			{
				currency: CURRENCY_SYMBOL,
				transactionLogChannel: null,
				infractionLogChannel: null,
				botLogChannel: null,
				auth: [],
				income,
			},
			{
				upsert: true,
				new: true,
			}
		);
	}
}
