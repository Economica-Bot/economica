import { REST } from '@discordjs/rest';
import express from 'express';
import { Logger } from 'tslog';
import { DataSource } from 'typeorm';

export class Economica {
	server: express.Express;

	rest: REST;

	log: Logger;

	db: DataSource;
}
