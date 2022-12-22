import { DataSource } from 'typeorm';

import * as entityFiles from './entities';
import { env } from './env.mjs';

export const datasource = await new DataSource({
	type: 'postgres',
	url: env.DB_URL,
	entities: Object.values(entityFiles),
	synchronize: env.DB_OPTION === 'sync',
	dropSchema: env.DB_OPTION === 'drop',
	useUTC: true
}).initialize();
