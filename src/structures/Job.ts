import { Economica } from './Economica';

export class Job {
	public name: string;

	public cooldown: number;

	public execute: (client: Economica) => Promise<void>;
}
