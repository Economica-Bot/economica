import { Economica } from './index.js';

export class Service {
	public service: string;
	public cooldown: number;
	public execute: (client: Economica) => Promise<void>;
}
