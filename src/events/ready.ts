import EconomicaClient from "../structures/EconomicaClient";

export const name = 'ready';

export async function execute(client: EconomicaClient) {
	console.log(`${client.user.tag} Ready`);
}
