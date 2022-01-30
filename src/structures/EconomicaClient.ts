import { Client, ClientOptions, Collection } from 'discord.js';
import { EconomicaSlashCommandBuilder } from '.';

import { EconomicaCommand } from './EconomicaCommand';

export class EconomicaClient extends Client {
	commands: Collection<String, EconomicaCommand>;
	constructor(options: ClientOptions) {
		super(options);
		this.commands = new Collection();
	}

	public getCommandData(query: string): EconomicaSlashCommandBuilder {
		return this.commands.find((command) => {
			const data = command.data as EconomicaSlashCommandBuilder;
			return data.name.toLowerCase() === query.toLowerCase();
		})?.data as EconomicaSlashCommandBuilder;
	}
}
