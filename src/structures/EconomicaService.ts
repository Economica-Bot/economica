import { EconomicaClient } from '.';

export class EconomicaService {
	name: string;
	cooldown: number;
	execute: (client: EconomicaClient) => Promise<void>;
}
