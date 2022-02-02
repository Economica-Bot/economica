import { ClientEvents } from 'discord.js';

import { EconomicaClient } from '.';

export class EconomicaEvent {
	public name: keyof ClientEvents;
	public execute: (client: EconomicaClient, ...args: any[]) => Promise<void>;
}
