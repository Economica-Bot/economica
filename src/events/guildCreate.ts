import { Guild } from 'discord.js';

import { GuildModel } from '../models';
import { EconomicaClient, EconomicaEvent } from '../structures';

export default class implements EconomicaEvent {
	public name = 'guildCreate' as const;
	public async execute(client: EconomicaClient, guild: Guild): Promise<void> {
		await GuildModel.findOneAndUpdate(
			{ guildId: guild.id },
			{},
			{ upsert: true, setDefaultsOnInsert: true, runValidators: true }
		);
	}
}
