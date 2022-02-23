import { ClientEvents } from 'discord.js';

export class Event {
	public event: keyof ClientEvents;
	public execute: (...args: unknown[]) => unknown | Promise<unknown>;
}
