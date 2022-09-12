import { ClientEvents } from 'discord.js';
import { Economica } from './Economica';

export class Event<T extends keyof ClientEvents> {
	public readonly event: T;

	public execute: (client: Economica, ...args: ClientEvents[T]) => unknown;
}
