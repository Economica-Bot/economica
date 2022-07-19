import { Economica } from '.';

export class Service {
	public service: string;
	public cooldown: number;
	public execute: (client: Economica) => Promise<void>;
}
