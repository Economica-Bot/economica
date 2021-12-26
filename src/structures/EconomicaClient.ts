import { Client, ClientOptions, Collection } from 'discord.js';
import EconomicaCommand from './EconomicaCommand';

export default class EconomicaClient extends Client {
	commands: Collection<String, EconomicaCommand>;
	constructor(options: ClientOptions) {
		super(options);
		this.commands = new Collection();
	}
}
