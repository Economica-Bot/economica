import { Client, Collection, WebhookClient } from 'discord.js';
import { Logger } from 'tslog';
import { DataSource } from 'typeorm';

import { Command } from '.';
import { clientOptions, loggerOptions } from '../config';

export class Economica extends Client {
	public constructor() {
		super(clientOptions);
		this.commands = new Collection();
		this.webhooks = [];
		this.log = new Logger(loggerOptions);
	}
}

declare module 'discord.js' {
	interface Client {
		commands: Collection<string, Command>;
		webhooks: WebhookClient[];
		AppDataSource: DataSource;
		log: Logger;
	}
}
