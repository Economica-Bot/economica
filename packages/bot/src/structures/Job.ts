import { Economica } from './Economica';

export class Job {
	public name: string;

	public cooldown: number;

	public execution: (client: Economica) => Promise<void>;
}
