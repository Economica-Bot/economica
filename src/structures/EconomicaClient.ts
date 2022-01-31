import { Client, ClientOptions, Collection, WebhookClient } from 'discord.js';
import { EconomicaSlashCommandBuilder } from '.';
import { WEBHOOK_URLS } from '../config';

import { EconomicaCommand } from './EconomicaCommand';

export class EconomicaClient extends Client {
	commands: Collection<String, EconomicaCommand>;
	webhooks: WebhookClient[] = [];
	constructor(options: ClientOptions) {
		super(options);
		this.commands = new Collection();
		WEBHOOK_URLS.forEach((WEBHOOK_URL) => {
			this.webhooks.push(new WebhookClient({ url: WEBHOOK_URL }));
		});
	}

	public getCommandData(query: string): EconomicaSlashCommandBuilder {
		return this.commands.find((command) => {
			const data = command.data as EconomicaSlashCommandBuilder;
			return data.name.toLowerCase() === query.toLowerCase();
		})?.data as EconomicaSlashCommandBuilder;
	}
}
