import { DataSource } from 'typeorm';

import * as entityFiles from './entities';
import { env } from './env.mjs';

export const datasource = await new DataSource({
	type: 'postgres',
	host: env.DB_HOST,
	port: env.DB_PORT,
	username: env.DB_USERNAME,
	password: env.DB_PASSWORD,
	entities: Object.values(entityFiles),
	synchronize: true,
	useUTC: true
}).initialize();
