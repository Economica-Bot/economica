import { Collection } from '@discordjs/collection';
import { REST } from '@discordjs/rest';
import express from 'express';
import { Logger } from 'tslog';
import { DataSource } from 'typeorm';

import { Command } from '.';
import { BOT_TOKEN, databaseOptions, loggerOptions, restOptions } from '../config';

export class Economica {
	server: express.Express;

	rest: REST;

	commands: Collection<string, Command>;

	log: Logger;

	db: DataSource;

	public constructor() {
		this.server = express();
		this.rest = new REST(restOptions).setToken(BOT_TOKEN);
		this.commands = new Collection();
		this.log = new Logger(loggerOptions);
		this.db = new DataSource(databaseOptions);
	}
}
