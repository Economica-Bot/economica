import { EconomicaClient } from '../structures';

export const name = 'ready';

export async function execute(client: EconomicaClient) {
	console.log(`${client.user.tag} Ready`);
}
