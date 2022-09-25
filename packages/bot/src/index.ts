// /$$$$$$$$$                                                       /$$
// | $$_____/                                                      |__/
// | $$        /$$$$$$$  /$$$$$$  /$$$$$$$   /$$$$$$  /$$$$$$/$$$$  /$$  /$$$$$$$  /$$$$$$
// | $$$$$    /$$_____/ /$$__  $$| $$__  $$ /$$__  $$| $$_  $$_  $$| $$ /$$_____/ |____  $$
// | $$__/   | $$      | $$  \ $$| $$  \ $$| $$  \ $$| $$ \ $$ \ $$| $$| $$        /$$$$$$$
// | $$      | $$      | $$  | $$| $$  | $$| $$  | $$| $$ | $$ | $$| $$| $$       /$$__  $$
// | $$$$$$$$|  $$$$$$$|  $$$$$$/| $$  | $$|  $$$$$$/| $$ | $$ | $$| $$|  $$$$$$$|  $$$$$$$
// |________/ \_______/ \______/ |__/  |__/ \______/ |__/ |__/ |__/|__/ \_______/ \_______/
import { Collection } from '@discordjs/collection';
import { REST } from '@discordjs/rest';
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord-api-types/v10';
import express from 'express';
import { Logger } from 'tslog';
import { DataSource } from 'typeorm';

import { routes } from './api';
import {
	BOT_TOKEN,
	CLIENT_ID,
	databaseOptions,
	DB_OPTION,
	DEBUG,
	DEPLOY_ALL_MODULES,
	DEPLOY_COMMANDS,
	DEVELOPMENT,
	DEVELOPMENT_GUILD_IDS,
	loggerOptions,
	PORT,
	restOptions,
} from './config.js';
import { Economica } from './structures/index.js';
import { DefaultModulesObj } from './typings';

const client = new Economica();

client.server = express();
client.rest = new REST(restOptions).setToken(BOT_TOKEN);
client.commands = new Collection();
client.log = new Logger(loggerOptions);

async function unhandledRejection(err: Error): Promise<void> {
	if (DEBUG) {
		client.log.fatal(err);
		process.exit(1);
	} else {
		client.log.error(err);
	}
}

async function uncaughtException(err: Error) {
	client.log.fatal(err);
	if (DEVELOPMENT) process.exit(1);
}

client.log.debug('Connecting to DB');
const entityFiles = await import('./entities');

client.db = await new DataSource({
	...databaseOptions,
	entities: Object.values(entityFiles),
}).initialize();
if (DB_OPTION === 1) {
	await client.db.synchronize();
	client.log.debug('Database synchronized');
} else if (DB_OPTION === 2) {
	await client.db.synchronize(true);
	client.log.debug('Database dropped and synchronized');
}

client.log.info('Connected to DB');

client.log.debug('Registering jobs');
const jobFiles = await import('./jobs');
Object.values(jobFiles).forEach(async (Constructor) => {
	const job = new Constructor();
	client.log.debug(`Loading job ${job.name}`);
	setInterval(async () => {
		client.log.info(`Executing ${job.name}`);
		await job.execution(client);
	}, job.cooldown);
});
client.log.info('Jobs registered');

client.log.debug('Registering commands');

const files = await import('./commands');
Object.values(files).forEach((Constructor) => {
	const command = new Constructor();

	// Validation
	if (!command.metadata.module) throw new Error(`Command ${command.metadata.name} missing module!`);
	if (!command.metadata.format) throw new Error(`Command ${command.metadata.name} missing format!`);
	if (!command.metadata.examples) throw new Error(`Command ${command.metadata.name} missing examples!`);

	client.log.debug(`Registering command ${command.metadata.name}`);
	client.commands.set(command.metadata.name, command);
});

const updateCommands = async () => {
	const defaultCommandData: RESTPostAPIApplicationCommandsJSONBody[] = [];
	const specialCommandData: RESTPostAPIApplicationCommandsJSONBody[] = [];
	client.commands.forEach((command) => {
		if (DefaultModulesObj[command.metadata.module].type === 'DEFAULT') defaultCommandData.push(command.metadata.toJSON());
		else specialCommandData.push(command.metadata.toJSON());
	});

	DEVELOPMENT_GUILD_IDS.forEach(async (id) => {
		if (DEPLOY_ALL_MODULES) await client.rest.put(Routes.applicationGuildCommands(CLIENT_ID, id), { body: specialCommandData });
		client.log.debug(`Registered special commands in dev guild ${id}`);
	});

	await client.rest.put(Routes.applicationCommands(CLIENT_ID), { body: defaultCommandData });
	client.log.debug('Registered global commands');
};

const resetCommands = async () => {
	DEVELOPMENT_GUILD_IDS.forEach(async (id) => {
		await client.rest.put(Routes.applicationGuildCommands(CLIENT_ID, id), { body: [] });
		client.log.debug(`Reset commands in dev guild ${id}`);
	});

	await client.rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
	client.log.debug('Reset global commands');
};

if (DEPLOY_COMMANDS === 0) {
	client.log.info('Commands Idle');
} else if (DEPLOY_COMMANDS === 1) {
	await updateCommands();
} else if (DEPLOY_COMMANDS === 2) {
	await resetCommands();
	await updateCommands();
}

client.log.info('Commands registered');

client.server
	.use((req, res, next) => { res.locals.client = client; next(); })
	.use('/api', routes)
	.listen(PORT, () => client.log.info(`Listening on port ${PORT}`));

process.on('unhandledRejection', (err: Error) => unhandledRejection(err));
process.on('uncaughtException', (err) => uncaughtException(err));

export { client as bot };
