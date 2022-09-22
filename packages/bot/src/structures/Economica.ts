import { Collection } from '@discordjs/collection';
import { REST } from '@discordjs/rest';
import express from 'express';
import { Logger } from 'tslog';
import { DataSource } from 'typeorm';

import { Command } from '.';

export class Economica {
	server: express.Express;

	rest: REST;

	commands: Collection<string, Command>;

	log: Logger;

	db: DataSource;
}
