import { EconomicaClient } from '.';

export class EconomicaService {
	public name: string;
	public cooldown: number;
	public execute: (client: EconomicaClient) => Promise<void>;
}
