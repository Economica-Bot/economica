import { Guild } from 'discord.js';
import { syncPermissions } from '../lib/index.js';

import { Economica, Event } from '../structures/index.js';

export default class implements Event {
	public event = 'guildCreate' as const;
	public async execute(client: Economica, guild: Guild): Promise<void> {
		await syncPermissions(client, guild);
	}
}
